"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { order, orderItem, cart } from "@/db/schema";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { formatError } from "../utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const dbCart = await getMyCart();
    const dbUser = await getUserById(userId);
    if (!dbCart || dbCart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!dbUser.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!dbUser.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // Create insert order object
    const insertOrder = insertOrderSchema.parse({
      userId: dbUser.id,
      shippingAddress: dbUser.address,
      paymentMethod: dbUser.paymentMethod,
      itemsPrice: dbCart.itemsPrice,
      shippingPrice: dbCart.shippingPrice,
      taxPrice: dbCart.taxPrice,
      totalPrice: dbCart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await db.transaction(async (tx) => {
      const insertedOrder = await tx
        .insert(order)
        .values(insertOrder)
        .returning();
      for (const item of dbCart.items) {
        await tx.insert(orderItem).values({
          ...item,
          price: Number(item.price).toFixed(2),
          orderId: insertedOrder[0].id,
        });
      }
      await db
        .update(cart)
        .set({
          items: [],
          totalPrice: "0",
          shippingPrice: "0",
          taxPrice: "0",
          itemsPrice: "0",
        })
        .where(eq(cart.id, cart.id));
      return insertedOrder[0].id;
    });
    if (!insertedOrderId) throw new Error("Order not created");
    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

// Get order by id
export async function getOrderById(orderId: string) {
  return await db.query.order.findFirst({
    where: eq(order.id, orderId),
    with: {
      orderItem: true,
      user: { columns: { name: true, email: true } },
    },
  });
}
