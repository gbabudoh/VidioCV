/* eslint-disable */
// @ts-nocheck
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27-acacia" as any, // Using latest stable or required version
  typescript: true,
});

export const getStripeSession = async (priceId: string, userId: string, customerEmail: string, stripeCustomerId?: string) => {
  return await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    metadata: {
      userId,
    },
  });
};
