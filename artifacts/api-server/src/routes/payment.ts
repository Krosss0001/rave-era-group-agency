import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { buildPaymentUrls } from "../lib/payment-security.js";
import {
  ALLIANCEPAY_HPP_CREATE_ORDER_URL,
  AlliancePayServiceMessageError,
  buildAlliancePayHppCreateOrderPayload,
  extractHppOrderId,
  extractRedirectUrl,
  getAlliancePayServiceMessage,
  getProviderErrorSummary,
  postAlliancePayJson,
  privateJwkLooksValid,
} from "../lib/alliancepay-hpp.js";

type DbModule = typeof import("@workspace/db");

const MERCHANT_ID = process.env["ALLIANCEPAY_MERCHANT_ID"] || "";
const SERVICE_CODE = process.env["ALLIANCEPAY_SERVICE_CODE"] || "";
const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  ALLIANCEPAY_HPP_CREATE_ORDER_URL;
const NOTIFICATION_URL =
  process.env["ALLIANCEPAY_NOTIFICATION_URL"] || "";
const PUBLIC_APP_ORIGIN =
  process.env["PUBLIC_APP_ORIGIN"] || "https://raveera.group";
const PRIVATE_JWK = process.env["ALLIANCEPAY_PRIVATE_JWK"];
const DEVICE_ID = process.env["ALLIANCEPAY_DEVICE_ID"];
const REFRESH_TOKEN = process.env["ALLIANCEPAY_REFRESH_TOKEN"];

function generateUUID(): string {
  return crypto.randomUUID();
}

const createOrderBodySchema = z.object({
  ticketType: z.enum(["sport", "business", "online"]),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  email: z.string().email().max(256),
  phone: z.string().min(10).max(20).optional(),
});

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const callbackBodySchema = z
  .object({
    hppOrderId: optionalNonEmptyString,
    merchantRequestId: optionalNonEmptyString,
    orderStatus: z.enum(["SUCCESS", "FAIL", "PENDING", "REQUIRED_3DS"]),
  })
  .passthrough()
  .refine((body) => Boolean(body.hppOrderId || body.merchantRequestId), {
    message: "Missing order identifier",
    path: ["merchantRequestId"],
  });

const ticketPrices: Record<string, number> = {
  sport: 250000,
  business: 650000,
  online: 10000,
};

const router: IRouter = Router();

async function getDb(): Promise<DbModule> {
  return import("@workspace/db");
}

function getMissingPaymentConfig(): string[] {
  const missing = ["ALLIANCEPAY_MERCHANT_ID"].filter((key) => !process.env[key]?.trim());
  if (!DEVICE_ID?.trim() || !REFRESH_TOKEN?.trim()) {
    if (!SERVICE_CODE.trim()) {
      missing.push("ALLIANCEPAY_SERVICE_CODE");
    }
    if (!privateJwkLooksValid(PRIVATE_JWK)) {
      missing.push("ALLIANCEPAY_PRIVATE_JWK");
    }
  }
  return missing;
}

router.post("/payment/create-order", async (req: Request, res: Response) => {
  try {
    const parsed = createOrderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
      return;
    }

    const missingConfig = getMissingPaymentConfig();
    if (missingConfig.length > 0) {
      logger.error({ missingConfig }, "Payment configuration missing");
      res.status(503).json({
        code: "MISSING_CONFIG",
        error: "Payment service is not configured",
        missingConfig,
      });
      return;
    }

    const { ticketType, firstName, lastName, email, phone } = parsed.data;
    const merchantRequestId = generateUUID();
    const coinAmount = ticketPrices[ticketType] ?? 0;
    if (!coinAmount) {
      res.status(400).json({ error: "Unknown ticket type" });
      return;
    }

    const { successUrl, failUrl, notificationUrl } = buildPaymentUrls({
      publicAppOrigin: PUBLIC_APP_ORIGIN,
      notificationUrl: NOTIFICATION_URL,
    });

    let dbModule: DbModule;
    try {
      dbModule = await getDb();
    } catch (err) {
      logger.error({ err, merchantRequestId }, "Payment database module failed to load");
      res.status(503).json({ error: "Payment database is unavailable" });
      return;
    }

    // 1) Save pending order to DB
    let inserted: { id: number };
    try {
      const result = await dbModule.pool.query<{ id: number }>(
        `insert into ticket_orders (
          merchant_request_id,
          ticket_type,
          amount_kopiykas,
          status,
          customer_email,
          customer_first_name,
          customer_last_name,
          customer_phone
        ) values ($1, $2, $3, 'PENDING', $4, $5, $6, $7)
        returning id`,
        [merchantRequestId, ticketType, coinAmount, email, firstName, lastName, phone || null],
      );
      const order = result.rows[0];
      if (!order) {
        throw new Error("Insert did not return an order id");
      }
      inserted = order;
    } catch (err) {
      logger.error({ err, merchantRequestId }, "Payment order insert failed");
      res.status(503).json({ error: "Payment database write failed" });
      return;
    }

    // 2) Build ALB payload
    const albPayload = buildAlliancePayHppCreateOrderPayload({
      merchantRequestId,
      merchantId: MERCHANT_ID,
      coinAmount,
      language: "uk",
      purpose: "SBC Summit Ukraine 2026",
      urls: { notificationUrl, successUrl, failUrl },
    });

    // 3) Call ALB API
    let redirectUrl: string | null = null;
    let hppOrderId: string | null = null;
    try {
      const { response: albRes, data: albData } = await postAlliancePayJson({
        url: ALB_API_URL,
        body: albPayload,
        authConfig: {
          apiUrl: ALB_API_URL,
          serviceCode: SERVICE_CODE,
          privateJwk: PRIVATE_JWK,
          deviceId: DEVICE_ID,
          refreshToken: REFRESH_TOKEN,
        },
      });
      if (!albRes.ok) {
        logger.warn(
          {
            status: albRes.status,
            merchantRequestId,
            providerError: getProviderErrorSummary(albData),
          },
          "ALB API error creating payment order",
        );
        res.status(502).json({
          error: "Payment provider error",
          orderId: inserted.id,
        });
        return;
      }

      const serviceMessage = getAlliancePayServiceMessage(albData);
      if (serviceMessage) {
        logger.warn(
          {
            status: albRes.status,
            merchantRequestId,
            providerMessage: serviceMessage,
          },
          "ALB API returned service message creating payment order",
        );
        res.status(502).json({
          code: "ALLIANCEPAY_SERVICE_MESSAGE",
          error: "AlliancePay returned a service message",
          orderId: inserted.id,
          providerMessage: serviceMessage,
        });
        return;
      }

      redirectUrl = extractRedirectUrl(albData);
      hppOrderId = extractHppOrderId(albData);
    } catch (err) {
      if (err instanceof AlliancePayServiceMessageError) {
        logger.warn(
          {
            providerStep: err.providerStep,
            providerStatus: err.providerStatus,
            providerMessage: err.providerMessage,
            merchantRequestId,
          },
          "ALB API returned service message",
        );
        res.status(502).json({
          code: "ALLIANCEPAY_SERVICE_MESSAGE",
          error: "AlliancePay returned a service message",
          orderId: inserted.id,
          providerStep: err.providerStep,
          providerStatus: err.providerStatus,
          providerMessage: err.providerMessage,
        });
        return;
      }

      logger.error({ err, merchantRequestId }, "ALB API network error creating payment order");
      res.status(502).json({
        error: "Payment provider unreachable",
        orderId: inserted.id,
      });
      return;
    }

    if (!redirectUrl) {
      logger.warn({ merchantRequestId }, "ALB API response missing redirect URL");
      res.status(502).json({
        error: "No redirect URL from payment provider",
        orderId: inserted.id,
      });
      return;
    }

    // 4) Update DB with ALB response
    try {
      await dbModule.pool.query(
        `update ticket_orders
         set hpp_order_id = $1, redirect_url = $2, status = 'PENDING', updated_at = now()
         where id = $3`,
        [hppOrderId || null, redirectUrl, inserted.id],
      );
    } catch (err) {
      logger.error({ err, merchantRequestId }, "Payment order update failed");
      res.status(503).json({ error: "Payment database update failed", orderId: inserted.id });
      return;
    }

    res.json({
      success: true,
      orderId: inserted.id,
      merchantRequestId,
      redirectUrl,
    });
  } catch (err) {
    logger.error({ err }, "Unhandled error in create-order");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ALB callback webhook
router.post("/payment/callback", async (req: Request, res: Response) => {
  try {
    const parsed = callbackBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid callback body", details: parsed.error.flatten() });
      return;
    }

    const { hppOrderId, orderStatus, merchantRequestId } = parsed.data;

    logger.info({ hppOrderId, orderStatus, merchantRequestId }, "ALB callback received");

    const dbModule = await getDb();
    let updatedOrderId: number | undefined;

    if (merchantRequestId) {
      const result = await dbModule.pool.query<{ id: number }>(
        `update ticket_orders
           set status = $1,
               hpp_order_id = coalesce(hpp_order_id, $2),
               updated_at = now()
           where merchant_request_id = $3
           returning id`,
        [orderStatus, hppOrderId || null, merchantRequestId],
      );
      updatedOrderId = result.rows[0]?.id;
    }

    if (!updatedOrderId && hppOrderId) {
      const result = await dbModule.pool.query<{ id: number }>(
        `update ticket_orders
           set status = $1, updated_at = now()
           where hpp_order_id = $2
           returning id`,
        [orderStatus, hppOrderId],
      );
      updatedOrderId = result.rows[0]?.id;
    }

    if (!updatedOrderId) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ received: true, orderId: updatedOrderId });
  } catch (err) {
    logger.error({ err }, "Unhandled error in callback");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payment/status/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);
    if (Number.isNaN(orderId)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }
    const dbModule = await getDb();
    const result = await dbModule.pool.query(
      `select id, status, ticket_type, amount_kopiykas, hpp_order_id,
        merchant_request_id, customer_email, created_at, updated_at
       from ticket_orders
       where id = $1
       limit 1`,
      [orderId],
    );
    const order = result.rows[0];

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({
      id: order.id,
      status: order.status,
      ticketType: order.ticket_type,
      amountKopiykas: order.amount_kopiykas,
      hppOrderId: order.hpp_order_id,
      merchantRequestId: order.merchant_request_id,
      customerEmail: order.customer_email,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  } catch (err) {
    logger.error({ err }, "Unhandled error in status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
