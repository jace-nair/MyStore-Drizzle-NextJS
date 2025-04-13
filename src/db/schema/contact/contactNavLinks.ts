import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
//import { relations } from "drizzle-orm";

//import { post } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema Table
export const contactNavLinks = pgTable("contact_nav_links", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    href: varchar("href", { length: 255 }).notNull().unique(),
});

// Schema Relations
/*
export const categoryRelations = relations(category, ({ many }) => ({
    posts: many(post),
}));
*/
// Schema Type
export const contactNavLinksSchema = createInsertSchema(contactNavLinks);
export type ContactNavLinksSchemaType = z.infer<typeof contactNavLinksSchema>;