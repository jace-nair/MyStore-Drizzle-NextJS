import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => user.id, {
      onDelete: "cascade",
    })
    .unique(),
  token: text("token"),
  tokenExpiry: timestamp("token_expiry"),
});
