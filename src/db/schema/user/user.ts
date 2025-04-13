import { InferSelectModel } from "drizzle-orm";
//import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
//import { post } from "@/db/schema"

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("role", ["guest", "user", "admin"]);

// Schema Table
export const user = pgTable("user", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().default("no name"),
  role: userRoleEnum("role").notNull().default("user"),
  age: integer("age").notNull().default(18),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  twoFactorSecret: varchar("2fa_secret"),
  twoFactorActivated: boolean("2fa_activated").default(false),
});

// Schema Relations
/*export const userRelations = relations(user, ({ many }) => ({
	posts: many(post),
}));*/

// Schema Type (drizzle schema -> drizzle-zod format -> zod format)
// covert drizzle schema to drizzle-zod format using "createInsertSchema" from drizzle-zod (Important)
const userBaseSchema = createInsertSchema(user, {
  name: (schema) => schema.min(1),
  password: (schema) => schema.min(1),
  age: z.coerce.number().min(18).max(99),
  email: (schema) => schema.email(),
}).pick({ name: true, password: true, age: true, email: true });

export const userSchema = z.union([
  z.object({
    mode: z.literal("signUp"),
    email: userBaseSchema.shape.email,
    password: userBaseSchema.shape.password,
    name: userBaseSchema.shape.name,
    age: userBaseSchema.shape.age,
  }),
  z.object({
    mode: z.literal("signIn"),
    email: userBaseSchema.shape.email,
    password: userBaseSchema.shape.password,
  }),
  z.object({
    mode: z.literal("update"),
    name: userBaseSchema.shape.name,
    age: userBaseSchema.shape.age,
    id: z.number().min(1),
  }),
]);

// Zod schema type. Now convert drizzle-zod format to zod format using "z" from zod (Important)
export type UserSchemaType = z.infer<typeof userSchema>;

// Drizzle-ORM schema typ. Use drizzle-orm "InferSelectModel" to DIRECTLY infer a database scheme from Drizzle to a type model. OR use Zod "z.infer". But Zod requires schema to be translated using "createInsertSchema" from drizzle-zod. Overall, Zod provides MORE options.

// Infer the data type directly form schema using Drizzle.
// Used with UserAvatar.tsx from auth components to display user avatar.
export type UserModelType = InferSelectModel<typeof user>;
