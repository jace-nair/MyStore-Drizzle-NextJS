"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

// Get latest products
export async function getLatestProducts() {
  const data = await db.query.product.findMany({
    orderBy: [desc(product.createdAt)],
    limit: LATEST_PRODUCTS_LIMIT,
  });
  return data;
}

// Get single product by it's slug
export async function getProductBySlug(slug: string) {
  return await db.query.product.findFirst({
    where: eq(product.slug, slug),
  });
}
