import { timestamp, serial } from "drizzle-orm/pg-core"

export const id = serial("id").primaryKey().notNull()
export const createdAt = timestamp("created_at", { mode: "date", withTimezone: true })
  .notNull()
  .defaultNow()
export const updatedAt = timestamp("updated_at", { mode: "date", withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date())