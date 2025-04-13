/*
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../utils/schemaHelpers";
import { courseProductTable } from "@/db/schema";
import { userCourseAccessTable } from "@/db/schema";
import { courseSectionTable } from "@/db/schema";

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema Table
export const courseTable = pgTable("courses", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  createdAt,
  updatedAt,
})

// Schema Relations
export const courseRelations = relations(courseTable, ({ many }) => ({
  courseProducts: many(courseProductTable),
  userCourseAccesses: many(userCourseAccessTable),
  courseSections: many(courseSectionTable),
}))

// Schema Type
export const courseTableSchema = createInsertSchema(courseTable, {
  name: (schema) => schema.min(1, "Required"),
  description: (schema) => schema.min(1, "Required"),
});

export type CourseTableSchemaType = z.infer<typeof courseTableSchema>;
*/
