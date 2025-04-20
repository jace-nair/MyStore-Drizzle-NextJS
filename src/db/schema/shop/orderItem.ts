import {
  integer,
  numeric,
  pgTable,
  text,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { product, order } from "@/db/schema";

export const orderItem = pgTable(
  "orderItem",
  {
    orderId: uuid("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: uuid("productId")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    image: text("image").notNull(),
  },
  (orderItem) => [
    {
      compoundKey: primaryKey({
        name: "orderItem_orderId_productId_pk",
        columns: [orderItem.orderId, orderItem.productId],
      }),
    },
  ]
);

export const orderItemsRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
}));
