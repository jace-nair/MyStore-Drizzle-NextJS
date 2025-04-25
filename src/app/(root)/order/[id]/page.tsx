import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";

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

  return (
    <OrderDetailsTable
      order={dbOrder}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
