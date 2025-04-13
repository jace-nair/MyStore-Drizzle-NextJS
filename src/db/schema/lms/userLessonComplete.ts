/*
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../utils/schemaHelpers"
import { relations } from "drizzle-orm"
import { user } from "@/db/schema"
import { lessonTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userLessonCompleteTable = pgTable(
  "user_lesson_complete",
  {
    userId: serial()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: serial()
      .notNull()
      .references(() => lessonTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  t => [primaryKey({ columns: [t.userId, t.lessonId] })]
)

export const userLessonCompleteRelations = relations(
  userLessonCompleteTable,
  ({ one }) => ({
    user: one(user, {
      fields: [userLessonCompleteTable.userId],
      references: [user.id],
    }),
    lesson: one(lessonTable, {
      fields: [userLessonCompleteTable.lessonId],
      references: [lessonTable.id],
    }),
  })
)

// Schema Type
export const userLessonCompleteTableSchema = createInsertSchema(userLessonCompleteTable);
export type UserLessonCompleteTableSchemaType = z.infer<typeof userLessonCompleteTableSchema>;
*/
