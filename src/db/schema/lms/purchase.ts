/*
import {
  pgTable,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../utils/schemaHelpers"
import { relations } from "drizzle-orm"
import { user } from "@/db/schema"
import { productTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema Table
export const purchaseTable = pgTable("purchases", {
  id,
  pricePaidInCents: integer().notNull(),
  productDetails: jsonb()
    .notNull()
    .$type<{ name: string; description: string; imageUrl: string }>(),
  userId: serial()
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  productId: serial()
    .notNull()
    .references(() => productTable.id, { onDelete: "restrict" }),
  stripeSessionId: text().notNull().unique(),
  refundedAt: timestamp({ withTimezone: true }),
  createdAt,
  updatedAt,
})

// Schema Relations
export const purchaseRelations = relations(purchaseTable, ({ one }) => ({
  user: one(user, {
    fields: [purchaseTable.userId],
    references: [user.id],
  }),
  product: one(productTable, {
    fields: [purchaseTable.productId],
    references: [productTable.id],
  }),
}))

// Schema Type
export const purchaseTableSchema = createInsertSchema(purchaseTable);
export type PurchaseTableSchemaType = z.infer<typeof purchaseTableSchema>;
*/
