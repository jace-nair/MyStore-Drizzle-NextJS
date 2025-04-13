/*
import { pgTable, text, serial, integer, pgEnum } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../utils/schemaHelpers"
import { relations } from "drizzle-orm"
import { courseSectionTable } from "@/db/schema"
import { userLessonCompleteTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lessonStatuses = ["public", "private", "preview"] as const
export type LessonStatus = (typeof lessonStatuses)[number]
export const lessonStatusEnum = pgEnum("lesson_status", lessonStatuses)

// Schema Table
export const lessonTable = pgTable("lessons", {
  id,
  name: text().notNull(),
  description: text(),
  youtubeVideoId: text().notNull(),
  order: integer().notNull(),
  status: lessonStatusEnum().notNull().default("private"),
  sectionId: serial()
    .notNull()
    .references(() => courseSectionTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
})

// Schema Relations
export const lessonRelations = relations(lessonTable, ({ one, many }) => ({
  section: one(courseSectionTable, {
    fields: [lessonTable.sectionId],
    references: [courseSectionTable.id],
  }),
  userLessonsComplete: many(userLessonCompleteTable),
}))

// Schema Type
export const lessonTableSchema = createInsertSchema(lessonTable);
export type LessonTableSchemaType = z.infer<typeof lessonTableSchema>;
*/
