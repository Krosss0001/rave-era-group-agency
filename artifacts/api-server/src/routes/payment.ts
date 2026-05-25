import { Router, type IRouter, type Request, type Response } from "express";
import { db, ticketOrdersTable } from "@workspace/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  CALLBACK_SIGNATURE_HEADER,
  verifyCallbackSignature,
  verifyCallbackToken,
} from "../lib/webhook-auth";

const MERCHANT_ID = process.env["ALLIANCEPAY_MERCHANT_ID"] || "";
const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  "https://pay.alb.ua/ecom/execute_request/hpp/v1/create-order";
const NOTIFICATION_URL =
  process.env["ALLIANCEPAY_NOTIFICATION_URL"] || "";
const CALLBACK_SECRET = process.env["ALLIANCEPAY_CALLBACK_SECRET"] || "";

type RequestWithRawBody = Request & { rawBody?: Buffer };

function generateUUID(): string {
  return crypto.randomUUID();
}

function addCallbackToken(url: string): string {
  if (!CALLBACK_SECRET) return url;

  const parsed = new URL(url);
  parsed.searchParams.set("callbackToken", CALLBACK_SECRET);
  return parsed.toString();
}

function getCallbackToken(req: Request): string | undefined {
  const value = req.query["callbackToken"];
  return typeof value === "string" ? value : undefined;
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
  online: 100000,
};

const router: IRouter = Router();

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

    const baseUrl = req.headers.origin || "https://raveera.group";
    const successUrl = `${baseUrl}/event/sbc-summit-ukraine-2026/payment/success`;
    const failUrl = `${baseUrl}/event/sbc-summit-ukraine-2026/payment/fail`;

    // 1) Save pending order to DB
    const [inserted] = await db
      .insert(ticketOrdersTable)
      .values({
        merchantRequestId,
        ticketType,
        amountKopiykas: coinAmount,
        status: "PENDING",
        customerEmail: email,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone || null,
      })
      .returning();

    // 2) Build ALB payload
    const albPayload = {
      merchantRequestId,
      merchantId: MERCHANT_ID,
      hppPayType: "PURCHASE",
      directType: "REDIRECT",
      coinAmount,
      paymentMethods: "CARD",
      language: "uk",
      notificationUrl: NOTIFICATION_URL || addCallbackToken(`${baseUrl}/api/payment/callback`),
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
        logger.warn({ status: albRes.status, albData }, "ALB API error");
        res.status(502).json({
          error: "Payment provider error",
          orderId: inserted.id,
        });
        return;
      }
      redirectUrl = String(albData.redirectUrl || "");
      hppOrderId = String(albData.hppOrderId || "");
    } catch (err) {
      logger.error({ err }, "ALB API network error");
      res.status(502).json({
        error: "Payment provider unreachable",
        orderId: inserted.id,
      });
      return;
    }

    if (!redirectUrl) {
      res.status(502).json({
        error: "No redirect URL from payment provider",
        orderId: inserted.id,
      });
      return;
    }

    // 4) Update DB with ALB response
    await db
      .update(ticketOrdersTable)
      .set({ hppOrderId, redirectUrl, status: "PENDING" })
      .where(eq(ticketOrdersTable.id, inserted.id));

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
    const signatureHeader = req.get(CALLBACK_SIGNATURE_HEADER);
    const authentication = signatureHeader
      ? verifyCallbackSignature({
          rawBody: (req as RequestWithRawBody).rawBody,
          secret: CALLBACK_SECRET,
          signatureHeader,
        })
      : verifyCallbackToken({
          secret: CALLBACK_SECRET,
          token: getCallbackToken(req),
        });
    if (!authentication.ok) {
      logger.warn({ reason: authentication.reason }, "Rejected unauthenticated ALB callback");
      res
        .status(authentication.reason === "missing_callback_secret" ? 500 : 401)
        .json({ error: "Unauthorized callback" });
      return;
    }

    const parsed = callbackBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid callback body", details: parsed.error.flatten() });
      return;
    }

    const { hppOrderId, orderStatus, merchantRequestId } = parsed.data;

    logger.info({ hppOrderId, orderStatus, merchantRequestId }, "ALB callback received");

    // Update by hppOrderId if available, otherwise by merchantRequestId
    const updateCondition = hppOrderId
      ? eq(ticketOrdersTable.hppOrderId, hppOrderId)
      : eq(ticketOrdersTable.merchantRequestId, merchantRequestId!);

    const [updated] = await db
      .update(ticketOrdersTable)
      .set({ status: orderStatus as string, updatedAt: new Date() })
      .where(updateCondition)
      .returning({ id: ticketOrdersTable.id });

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
    const [order] = await db
      .select()
      .from(ticketOrdersTable)
      .where(eq(ticketOrdersTable.id, orderId))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({
      id: order.id,
      status: order.status,
      ticketType: order.ticketType,
      amountKopiykas: order.amountKopiykas,
      hppOrderId: order.hppOrderId,
      merchantRequestId: order.merchantRequestId,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    logger.error({ err }, "Unhandled error in status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
