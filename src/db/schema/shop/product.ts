import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Schema Table
export const product = pgTable(
  "product",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    images: text("images").array().notNull(),
    brand: text("brand").notNull(),
    description: text("description").notNull(),
    stock: integer("stock").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
    rating: numeric("rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    numReviews: integer("numReviews").notNull().default(0),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    banner: text("banner"),
    createdAt: timestamp("createdAt", { precision: 6 }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("product_slug_idx").on(table.slug)]
);

// Schema Relations

// Schema Type
export type ProductModelType = InferSelectModel<typeof product>;
