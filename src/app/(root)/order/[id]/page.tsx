import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";

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

  return <OrderDetailsTable order={dbOrder} />;
};

export default OrderDetailsPage;
