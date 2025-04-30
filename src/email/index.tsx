import { Resend } from "resend";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import { Order } from "@/types";
// Require "dotenv" to access API key in the .env as we are not in the regular NextJS structure. This will give access to environment variables.

/* eslint-disable  @typescript-eslint/no-require-imports */
require("dotenv").config();
import PurchaseReceiptEmail from "./purchase-receipt";

// Create a new resend instance or object
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Create a function to send purchase receipt
export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  // Use the new resend instance to send email
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
