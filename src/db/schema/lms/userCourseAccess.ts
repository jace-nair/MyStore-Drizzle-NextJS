/*
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../utils/schemaHelpers"
import { relations } from "drizzle-orm"
import { user } from "@/db/schema"
import { courseTable } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema Table
export const userCourseAccessTable = pgTable(
  "user_course_access",
  {
    userId: serial()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: serial()
      .notNull()
      .references(() => courseTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  t => [primaryKey({ columns: [t.userId, t.courseId] })]
)

// Schema Relations
export const userCourseAccessRelations = relations(
  userCourseAccessTable,
  ({ one }) => ({
    user: one(user, {
      fields: [userCourseAccessTable.userId],
      references: [user.id],
    }),
    course: one(courseTable, {
      fields: [userCourseAccessTable.courseId],
      references: [courseTable.id],
    }),
  })
)

// Schema Type
export const userCourseAccessTableSchema = createInsertSchema(userCourseAccessTable);
export type UserCourseAccessTableSchemaType = z.infer<typeof userCourseAccessTableSchema>;
*/
