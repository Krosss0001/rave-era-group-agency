import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { buildPaymentUrls } from "../lib/payment-security.js";

type DbModule = typeof import("@workspace/db");

const MERCHANT_ID = process.env["ALLIANCEPAY_MERCHANT_ID"] || "";
const SERVICE_CODE = process.env["ALLIANCEPAY_SERVICE_CODE"] || "";
const MERCHANT_ALIAS_ID = process.env["ALLIANCEPAY_MERCHANT_ALIAS_ID"] || "";
const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  "https://pay.alb.ua/ecom/execute_request/hpp/v1/create-order";
const NOTIFICATION_URL =
  process.env["ALLIANCEPAY_NOTIFICATION_URL"] || "";
const PUBLIC_APP_ORIGIN =
  process.env["PUBLIC_APP_ORIGIN"] || "https://raveera.group";

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

function getProviderErrorSummary(data: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of ["error", "errorCode", "code", "message", "status", "reason"]) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      summary[key] = value;
    }
  }
  return summary;
}

router.post("/payment/create-order", async (req: Request, res: Response) => {
  try {
    const parsed = createOrderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
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
    const albPayload = {
      merchantRequestId,
      merchantId: MERCHANT_ID,
      ...(SERVICE_CODE ? { serviceCode: SERVICE_CODE } : {}),
      ...(MERCHANT_ALIAS_ID ? { merchantAliasId: MERCHANT_ALIAS_ID } : {}),
      hppPayType: "PURCHASE",
      directType: "REDIRECT",
      coinAmount,
      paymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
      language: "uk",
      notificationUrl,
      successUrl,
      failUrl,
      statusPageType: "STATUS_TIMER_PAGE",
      purpose: "SBC Summit Ukraine 2026",
      customerData: {
        senderFirstName: firstName,
        senderLastName: lastName,
        senderEmail: email,
        senderPhone: phone || undefined,
      },
    };

    // 3) Call ALB API
    let redirectUrl: string | null = null;
    let hppOrderId: string | null = null;
    try {
      const albRes = await fetch(ALB_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(albPayload),
      });
      const albData = await albRes.json().catch(() => ({} as Record<string, unknown>));
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
      redirectUrl = String(albData.redirectUrl || "");
      hppOrderId = String(albData.hppOrderId || "");
    } catch (err) {
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
    const result = hppOrderId
      ? await dbModule.pool.query<{ id: number }>(
        `update ticket_orders
           set status = $1, updated_at = now()
           where hpp_order_id = $2
           returning id`,
        [orderStatus, hppOrderId],
      )
      : await dbModule.pool.query<{ id: number }>(
        `update ticket_orders
           set status = $1, updated_at = now()
           where merchant_request_id = $2
           returning id`,
        [orderStatus, merchantRequestId],
      );

    const updated = result.rows[0];

    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ received: true });
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
