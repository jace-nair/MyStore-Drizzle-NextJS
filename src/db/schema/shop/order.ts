import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  json,
  uuid,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { user, orderItem } from "@/db/schema";
import { PaymentResult, ShippingAddress } from "@/types";

export const order = pgTable("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  shippingAddress: json("shippingAddress").$type<ShippingAddress>().notNull(),
  paymentMethod: text("paymentMethod").notNull(),
  paymentResult: json("paymentResult").$type<PaymentResult>(),
  itemsPrice: numeric("itemsPrice", { precision: 12, scale: 2 }).notNull(),
  shippingPrice: numeric("shippingPrice", {
    precision: 12,
    scale: 2,
  }).notNull(),
  taxPrice: numeric("taxPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean("isPaid").notNull().default(false),
  paidAt: timestamp("paidAt"),
  isDelivered: boolean("isDelivered").notNull().default(false),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const ordersRelations = relations(order, ({ one, many }) => ({
  orderItem: many(orderItem),
  user: one(user, { fields: [order.userId], references: [user.id] }),
}));
