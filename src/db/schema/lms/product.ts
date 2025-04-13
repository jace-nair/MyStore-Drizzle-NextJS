/*
import { relations } from "drizzle-orm"
import { pgTable, text, integer, pgEnum } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../utils/schemaHelpers"
import { courseProductTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productStatuses = ["public", "private"] as const
export type ProductStatus = (typeof productStatuses)[number]
export const productStatusEnum = pgEnum("product_status", productStatuses)

// Schema Table
export const productTable = pgTable("products_lms", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: productStatusEnum().notNull().default("private"),
  createdAt,
  updatedAt,
})

// Schema Relations
export const productRelations = relations(productTable, ({ many }) => ({
  courseProducts: many(courseProductTable),
}))

// Schema Type
export const productTableSchema = createInsertSchema(productTable);
export type ProductTableSchemaType = z.infer<typeof productTableSchema>;
*/
