"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { desc, eq, ilike, sql, and, count } from "drizzle-orm";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { formatError } from "../utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";

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

// Get single product by it's ID
export async function getProductById(productId: string) {
  return await db.query.product.findFirst({
    where: eq(product.id, productId),
  });
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  category?: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const queryFilter =
    query && query !== "all" ? ilike(product.name, `%${query}%`) : undefined;
  const categoryFilter =
    category && category !== "all" ? eq(product.category, category) : undefined;
  const ratingFilter =
    rating && rating !== "all"
      ? sql`${product.rating} >= ${rating}`
      : undefined;
  // 100-200
  const priceFilter =
    price && price !== "all"
      ? sql`${product.price} >= ${price.split("-")[0]} AND ${
          product.price
        } <= ${price.split("-")[1]}`
      : undefined;
  const order =
    sort === "lowest"
      ? product.price
      : sort === "highest"
      ? desc(product.price)
      : sort === "rating"
      ? desc(product.rating)
      : desc(product.createdAt);

  const condition = and(queryFilter, categoryFilter, ratingFilter, priceFilter);
  const data = await db
    .select()
    .from(product)
    .where(condition)
    .orderBy(order)
    .offset((page - 1) * limit)
    .limit(limit);

  const dataCount = await db
    .select({ count: count() })
    .from(product)
    .where(condition);

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productExists = await db.query.product.findFirst({
      where: eq(product.id, id),
    });
    if (!productExists) throw new Error("Product not found");
    await db.delete(product).where(eq(product.id, id));
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const insertProduct = insertProductSchema.parse(data);
    await db.insert(product).values(insertProduct);

    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const parsedProduct = updateProductSchema.parse(data);
    const productExists = await db.query.product.findFirst({
      where: eq(product.id, parsedProduct.id),
    });
    if (!productExists) throw new Error("Product not found");
    await db
      .update(product)
      .set(parsedProduct)
      .where(eq(product.id, parsedProduct.id));
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/*
//Get all categories - old
export async function getAllCategories() {
  const data = await db
    .selectDistinctOn([product.category], { name: product.category })
    .from(product)
    .orderBy(product.category);
  return data;
}
*/

// Get all categories with count
export async function getAllCategories() {
  const data = await db
    .select({
      category: product.category,
      _count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(product)
    .groupBy(product.category);

  return data;
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await db.query.product.findMany({
    where: eq(product.isFeatured, true),
    orderBy: [desc(product.createdAt)],
    limit: 4,
  });
  return data;
}
