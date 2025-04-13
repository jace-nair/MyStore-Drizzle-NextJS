/*
import {
    text,
    serial,
    timestamp,
	pgTable,
} from "drizzle-orm/pg-core";

import { user } from "@/db/schema";

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
  */
