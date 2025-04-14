//import { InferSelectModel } from "drizzle-orm";
//import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  json,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
//import { post } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("role", ["guest", "user", "admin"]);

// Schema Table
export const user = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().default("no name"),
    age: integer("age").notNull().default(18),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: timestamp("createdAt", { precision: 6 }),
    image: text("image"),
    password: varchar("password", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    address: json("address"),
    paymentMethod: text("payment_method"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    twoFactorSecret: varchar("2fa_secret"),
    twoFactorActivated: boolean("2fa_activated").default(false),
  },
  (table) => [uniqueIndex("user_email_idx").on(table.email)]
);
