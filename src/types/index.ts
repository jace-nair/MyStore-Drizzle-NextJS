import { z } from "zod";
//import { cart } from "@/db/schema";
//import { InferSelectModel } from "drizzle-orm";
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  paymentResultSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  insertReviewSchema,
} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;
//export type Cart = InferSelectModel<typeof cart>;

export type CartItem = z.infer<typeof cartItemSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentResult = z.infer<typeof paymentResultSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  /* eslint-disable @typescript-eslint/no-wrapper-object-types */
  isPaid: Boolean;
  paidAt: Date | null;
  /* eslint-disable @typescript-eslint/no-wrapper-object-types */
  isDelivered: Boolean;
  deliveredAt: Date | null;
  orderItem: OrderItem[];
  user: { name: string; email: string };
};

export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};
