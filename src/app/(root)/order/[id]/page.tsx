import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details",
};

type Props = {
  params: Promise<{ id: string }>;
};

const OrderDetailsPage = async (props: Props) => {
  const { id } = await props.params;

  const dbOrder = await getOrderById(id);
  if (!dbOrder) {
    notFound();
  }

  // To make sure user has admin role, get the session here on the server component side and pass it on as a prop to the OrderDetailsTable which is a client component
  const session = await auth();

  // For Stripe
  // Initialize client_secret with null. Later get the value from the payment intent.
  let client_secret = null;

  // Check if is not paid and using Stripe
  if (dbOrder.paymentMethod === "Stripe" && !dbOrder.isPaid) {
    // Initialize a Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(dbOrder.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: dbOrder.id },
    });

    // Check client_secret is always defined before rendering the page.
    if (!paymentIntent.client_secret) {
      throw new Error(
        "Failed to create PaymentIntent. No client_secret returned."
      );
    }

    // Value from the payment intent
    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={dbOrder}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
