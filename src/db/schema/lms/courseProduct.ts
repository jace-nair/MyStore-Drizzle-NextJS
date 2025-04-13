/*
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { courseTable } from "@/db/schema";
import { productTable } from "@/db/schema";
import { createdAt, updatedAt } from "../utils/schemaHelpers";
import { relations } from "drizzle-orm";

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


// Schema Table
export const courseProductTable = pgTable(
  "course_products",
  {
    courseId: serial()
      .notNull()
      .references(() => courseTable.id, { onDelete: "restrict" }),
    productId: serial()
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  t => [primaryKey({ columns: [t.courseId, t.productId] })]
)

// Schema Relations
export const courseProductRelations = relations(
  courseProductTable,
  ({ one }) => ({
    course: one(courseTable, {
      fields: [courseProductTable.courseId],
      references: [courseTable.id],
    }),
    product: one(productTable, {
      fields: [courseProductTable.productId],
      references: [productTable.id],
    }),
  })
)

// Schema Type
export const courseProductTableSchema = createInsertSchema(courseProductTable);
export type CourseProductTableSchemaType = z.infer<typeof courseProductTableSchema>;
*/
