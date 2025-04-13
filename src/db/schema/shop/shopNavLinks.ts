import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
//import { relations } from "drizzle-orm";

//import { post } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema Table
export const shopNavLinks = pgTable("shop_nav_links", {
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
export const shopNavLinksSchema = createInsertSchema(shopNavLinks);
export type ShopNavLinksSchemaType = z.infer<typeof shopNavLinksSchema>;