"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { db } from "@/db";
import { cart, product } from "@/db/schema";
import { cartItemSchema, insertCartSchema } from "../validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Calculate cart prices (tax, shipping etc)
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    // Fix price to two decimal places
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

//ADD ITEM TO CART
export async function addItemToCart(data: CartItem) {
  try {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("sessionCardId not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get cart
    const getCart = await getMyCart();

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Find product in database
    const dbProduct = await db.query.product.findFirst({
      where: eq(product.id, item.productId),
    });
    if (!dbProduct) throw new Error("Product not found");

    // Create a cart if there is none
    if (!getCart) {
      // Create a new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      //TESTING
      //console.log(newCart);

      // Add the new cart to the cart database
      await db.insert(cart).values({
        ...newCart,
      });

      // Revalidate product page to clear cache
      revalidatePath(`/product/${dbProduct.slug}`);

      return {
        success: true,
        message: `${dbProduct.name} added to cart`,
      };
    } else {
      // Check if item already exists in the cart
      const existItem = (getCart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        // Check for sufficient stock
        if (Number(product.stock) < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase the quantity
        (getCart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        // If item does not exist in cart
        // Check for sufficient stock
        if (Number(product.stock) < 1) {
          throw new Error("Not enough stock");
        }

        // Add item to cart.items
        getCart.items.push(item);
      }

      // Save to the database
      await db
        .update(cart)
        .set({
          items: getCart.items,
          ...calcPrice(getCart.items),
        })
        .where(eq(cart.id, getCart.id));

      // Revalidate product page to clear cache
      revalidatePath(`/product/${dbProduct.slug}`);

      return {
        success: true,
        message: `${dbProduct.name} ${
          existItem ? "updated in" : "added to"
        } cart`,
      };
    }

    // TESTING
    /*
    console.log({
      "Session Cart ID": sessionCartId,
      "User ID": userId,
      "Item Requested From Cart": item,
      "Product Found from Database": dbProduct,
    });
    */
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// GET CART
export async function getMyCart() {
  // Check for the cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  if (!sessionCartId) throw new Error("sessionCardId not found");

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const dbCart = await db.query.cart.findFirst({
    where: userId
      ? eq(cart.userId, userId)
      : eq(cart.sessionCartId, sessionCartId),
  });

  if (!dbCart) return undefined;

  return dbCart;
}

// REMOVE ITEM FROM CART
export async function removeItemFromCart(productId: string) {
  try {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("sessionCardId not found");

    // Get product
    const dbProduct = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });
    if (!dbProduct) throw new Error("Product not found");

    // Get cart
    const getCart = await getMyCart();
    if (!getCart) {
      throw new Error("Cart not found");
    }

    // Check if item already exists in the cart
    const existItem = (getCart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!existItem) {
      throw new Error("Item not found");
    }

    // Check if the item has only one or more quantity
    // Check if only one in quantity
    if (existItem.qty === 1) {
      // Remove or filter out the whole item from the cart
      getCart.items = (getCart.items as CartItem[]).filter(
        (x) => x.productId !== existItem.productId
      );
    } else {
      // If the quantity is more than 1, decrease it
      (getCart.items as CartItem[]).find(
        (x) => x.productId === productId
      )!.qty = existItem.qty - 1;
    }

    // Update cart in database
    await db
      .update(cart)
      .set({
        items: getCart.items,
        ...calcPrice(getCart.items),
      })
      .where(eq(cart.id, getCart.id));

    // Revalidate product page to clear cache
    revalidatePath(`/product/${dbProduct.slug}`);

    return {
      success: true,
      message: `${dbProduct.name} was removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
