import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

// Initialize a new stripe object
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    payment_intent: string;
  }>;
};

const SuccessPage = async (props: Props) => {
  // Destructure
  const { id } = await props.params;
  // paymentIntentId is alias for payment_intent_id
  const { payment_intent: paymentIntentId } = await props.searchParams;

  /*if (!paymentIntentId) {
    throw new Error("Missing payment intent ID");
  }*/

  /*if (!paymentIntentId) {
    return redirect(`/order/${id}`);
  }*/

  // Fetch order
  const dbOrder = await getOrderById(id);
  if (!dbOrder) {
    notFound();
  }

  //TEST
  console.log(`paymentIntentId is:${paymentIntentId}`);

  // Retrieve payment intent using the payment_intent_id value
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Check if payemntIntent is valid. We get cccess to orderId, because it comes from the metadata passed in to create paymentIntent in order->[id]->page.tsx
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== dbOrder.id.toString()
  ) {
    return notFound();
  }

  // Check if payment is successful
  const isSuccess = paymentIntent.status === "succeeded";

  if (!isSuccess) {
    return redirect(`/order/${id}`);
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <div>We are processing your order</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
