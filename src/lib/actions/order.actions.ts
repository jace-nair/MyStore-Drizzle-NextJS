"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, sql, desc, count, sum } from "drizzle-orm";
import { order, orderItem, cart, product, user } from "@/db/schema";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { formatError } from "../utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";

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

// Create new Paypal order
// Calls createOrder from the paypal.ts file
// Action to be used for Paypal button
// orderId is the actual UUID in the order database table
export async function createPayPalOrder(orderId: string) {
  try {
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    });
    if (dbOrder) {
      const paypalOrder = await paypal.createOrder(Number(dbOrder.totalPrice));
      await db
        .update(order)
        .set({
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0",
          },
        })
        .where(eq(order.id, orderId));
      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Approve Paypal order and update order to be paid
// Calls capturePayment from the paypal.ts file
// Will make a request to Paypal with the orderId
// Once approved it will give us a status of COMPLETED
// Action to be used for Paypal button
// orderId is the actual UUID in the order database table
// OrderID is the Paypal OrderID form the payment result
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // Get order from the database
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    });
    if (!dbOrder) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (dbOrder.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in paypal payment");
    }

    // Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Update Order to be paid
export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) => {
  // Get it from database
  const dbOrder = await db.query.order.findFirst({
    columns: { isPaid: true },
    where: eq(order.id, orderId),
    with: { orderItem: true },
  });
  if (!dbOrder) throw new Error("Order not found");
  if (dbOrder.isPaid) throw new Error("Order is already paid");

  // Transaction to update order and account for product stock
  // Transaction is going to no only update the order (isPaid, paidAt, paymentResult object) but also adjusts the stock in the product table.
  await db.transaction(async (tx) => {
    for (const item of dbOrder.orderItem) {
      await tx
        .update(product)
        .set({
          stock: sql`${product.stock} - ${item.qty}`,
        })
        .where(eq(product.id, item.productId));
    }
    // Set the order to paid
    await tx
      .update(order)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      })
      .where(eq(order.id, orderId));
  });

  // Get updated order after transaction
  const updatedOrder = await db.query.order.findFirst({
    where: eq(order.id, orderId),
    with: { orderItem: true, user: { columns: { name: true, email: true } } },
  });
  if (!updatedOrder) {
    throw new Error("Order not found");
  }
  //await sendPurchaseReceipt({ order: updatedOrder });
};

// Cash on delivery - Update COD order to paid
export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Deliver Order - Update COD order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    });
    if (!dbOrder) throw new Error("Order not found");
    if (!dbOrder.isPaid) throw new Error("Order is not paid");

    await db
      .update(order)
      .set({
        isDelivered: true,
        deliveredAt: new Date(),
      })
      .where(eq(order.id, orderId));
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const data = await db.query.order.findMany({
    /* eslint-disable  @typescript-eslint/no-non-null-asserted-optional-chain */
    where: eq(order.userId, session?.user?.id!),
    orderBy: [desc(product.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
  const dataCount = await db
    .select({ count: count() })
    .from(order)
    /* eslint-disable  @typescript-eslint/no-non-null-asserted-optional-chain */
    .where(eq(order.userId, session?.user?.id!));

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Define the types for salesData
/* eslint-disable @typescript-eslint/no-unused-vars */
type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await db.select({ count: count() }).from(order);
  const productsCount = await db.select({ count: count() }).from(product);
  const usersCount = await db.select({ count: count() }).from(user);

  // Calculate the total sales or orders
  // Take the totalPrice field in the order table and add them all together or sum it up
  const totalSales = await db
    .select({ sum: sum(order.totalPrice) })
    .from(order);

  // Get monthly sales and group it by the month and the year.
  // createdAt as an alias for month in MM/YY format
  // sum of the totalPrice as an alias for totalSales
  // The return for totalSales will be in the format of Drizzle decimal, so map through it and convert it to a number.
  const salesData = await db
    .select({
      month: sql<string>`to_char(${order.createdAt},'MM/YY')`,
      totalSales: sql<number>`sum(${order.totalPrice})`.mapWith(Number),
    })
    .from(order)
    .groupBy(sql`1`);

  // Get latest sales or orders
  const latestSales = await db.query.order.findMany({
    orderBy: [desc(order.createdAt)],
    with: {
      user: { columns: { name: true } },
    },
    limit: 6,
  });
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await db.query.order.findMany({
    orderBy: [desc(product.createdAt)],
    limit,
    offset: (page - 1) * limit,
    with: { user: { columns: { name: true } } },
  });
  const dataCount = await db.select({ count: count() }).from(order);

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await db.delete(order).where(eq(order.id, id));
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
