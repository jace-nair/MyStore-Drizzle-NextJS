/*
import { integer, pgEnum, pgTable, text, serial } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../utils/schemaHelpers"
import { courseTable } from "@/db/schema"
import { relations } from "drizzle-orm"
import { lessonTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courseSectionStatuses = ["public", "private"] as const
export type CourseSectionStatus = (typeof courseSectionStatuses)[number]
export const courseSectionStatusEnum = pgEnum(
  "course_section_status",
  courseSectionStatuses
)

// Schema Table
export const courseSectionTable = pgTable("course_sections", {
  id,
  name: text().notNull(),
  status: courseSectionStatusEnum().notNull().default("private"),
  order: integer().notNull(),
  courseId: serial()
    .notNull()
    .references(() => courseTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
})


// Schema Relations
export const courseSectionRelations = relations(
  courseSectionTable,
  ({ many, one }) => ({
    course: one(courseTable, {
      fields: [courseSectionTable.courseId],
      references: [courseTable.id],
    }),
    lessons: many(lessonTable),
  })
)

// Schema Type
export const courseSectionTableSchema = createInsertSchema(courseSectionTable);
export type CourseSectionTableSchemaType = z.infer<typeof courseSectionTableSchema>;
*/
