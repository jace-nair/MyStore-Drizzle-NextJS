CREATE TYPE "public"."role" AS ENUM('guest', 'user', 'admin');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'no name' NOT NULL,
	"age" integer DEFAULT 18 NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp (6),
	"image" text,
	"password" varchar(255) NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"address" json,
	"payment_method" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"2fa_secret" varchar,
	"2fa_activated" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"images" text[] NOT NULL,
	"brand" text NOT NULL,
	"description" text NOT NULL,
	"stock" integer NOT NULL,
	"price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"numReviews" integer DEFAULT 0 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"banner" text,
	"createdAt" timestamp (6) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"sessionCartId" text NOT NULL,
	"items" json DEFAULT '[]'::json NOT NULL,
	"itemsPrice" numeric(12, 2) NOT NULL,
	"shippingPrice" numeric(12, 2) NOT NULL,
	"taxPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"shippingAddress" json NOT NULL,
	"paymentMethod" text NOT NULL,
	"paymentResult" json,
	"itemsPrice" numeric(12, 2) NOT NULL,
	"shippingPrice" numeric(12, 2) NOT NULL,
	"taxPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"isPaid" boolean DEFAULT false NOT NULL,
	"paidAt" timestamp,
	"isDelivered" boolean DEFAULT false NOT NULL,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItem" (
	"orderId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"qty" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"isVerifiedPurchase" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_idx" ON "product" USING btree ("slug");