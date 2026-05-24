import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const ticketOrdersTable = pgTable("ticket_orders", {
  id: serial("id").primaryKey(),
  hppOrderId: text("hpp_order_id"),
  merchantRequestId: text("merchant_request_id").notNull().unique(),
  ticketType: text("ticket_type").notNull(),
  amountKopiykas: integer("amount_kopiykas").notNull(),
  status: text("status").notNull().default("PENDING"),
  customerEmail: text("customer_email").notNull(),
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerPhone: text("customer_phone"),
  redirectUrl: text("redirect_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type TicketOrder = typeof ticketOrdersTable.$inferSelect;
