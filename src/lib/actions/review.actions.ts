"use server";

import { db } from "@/db";
import { review, product } from "@/db/schema";
import { desc, eq, sql, and, count } from "drizzle-orm";
import { PAGE_SIZE } from "../constants";
import { formatError } from "../utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { auth } from "@/auth";

// Create and Update Reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    // Get the session
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // Validate and store the review in a variable
    const parsedReview = insertReviewSchema.parse({
      ...data,
      userId: session?.user.id,
    });

    // Get the product that is being reviewed
    const dbProduct = await db.query.product.findFirst({
      where: eq(product.id, parsedReview.productId),
    });
    if (!dbProduct) throw new Error("Product not found");

    // Check if the user has already reviewed the product and if it exists then store it in reviewExists variable
    const reviewExists = await db.query.review.findFirst({
      where: and(
        eq(review.productId, parsedReview.productId),
        eq(review.userId, parsedReview.userId)
      ),
    });

    // Do a transaction. In the transaction if the review exists then update it. If it doesn't exist then create the review. Also get average rating and number of reviews. All will happen in a single transaction. if one thing fails in a transaction, then nothing gets run.
    await db.transaction(async (tx) => {
      if (reviewExists) {
        // Update review
        await tx
          .update(review)
          .set({
            description: parsedReview.description,
            title: parsedReview.title,
            rating: parsedReview.rating,
          })
          .where(eq(review.id, reviewExists.id));
      } else {
        // Create review
        await tx.insert(review).values(parsedReview);
      }
      // Get average review rating of the product
      const averageRating = db.$with("average_rating").as(
        db
          .select({ value: sql`avg(${review.rating})`.as("value") })
          .from(review)
          .where(eq(review.productId, parsedReview.productId))
      );
      // Get number of reviews
      const numReviews = db.$with("num_reviews").as(
        db
          .select({ value: sql`count(*)`.as("value") })
          .from(review)
          .where(eq(review.productId, parsedReview.productId))
      );
      // Update the averageRating and numReviews in product table
      await tx
        .with(averageRating, numReviews)
        .update(product)
        .set({
          rating: sql`(select * from ${averageRating})`,
          numReviews: sql`(select * from ${numReviews})`,
        })
        .where(eq(product.id, parsedReview.productId));
    });

    revalidatePath(`/product/${dbProduct.slug}`);
    return {
      success: true,
      message: "Review updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get all reviews for a product
export async function getReviews({
  productId,
}: //limit = PAGE_SIZE,
//page,
{
  productId: string;
  //limit?: number;
  //page: number;
}) {
  const data = await db.query.review.findMany({
    where: eq(review.productId, productId),
    with: { user: { columns: { name: true } } },
    orderBy: [desc(review.createdAt)],
    //limit,
    //offset: (page - 1) * limit,
  });

  /*const dataCount = await db
    .select({ count: count() })
    .from(review)
    .where(eq(review.productId, productId));*/
  return {
    data,
    //totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Get all reviews for a product with pagination
export async function getReviewsWithPagination({
  productId,
  limit = PAGE_SIZE,
  page,
}: {
  productId: string;
  limit?: number;
  page: number;
}) {
  const data = await db.query.review.findMany({
    where: eq(review.productId, productId),
    with: { user: { columns: { name: true } } },
    orderBy: [desc(review.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
  const dataCount = await db
    .select({ count: count() })
    .from(review)
    .where(eq(review.productId, productId));
  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Get a review written by the current user
export const getUserReviewByProductId = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  return await db.query.review.findFirst({
    where: and(
      eq(review.productId, productId),
      /* eslint-disable  @typescript-eslint/no-non-null-asserted-optional-chain */
      eq(review.userId, session?.user.id!)
    ),
  });
};
