// app/products/[id]/purchase.tsx

import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
    params: { id },
    searchParams: { quantity },
}: {
    params: { id: string };
    searchParams: { quantity?: string };
}) {
    const product = await db.product.findUnique({ where: { id } });
    if (product == null) return notFound();

    const quantityInt = parseInt(quantity || "1", 10);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: product.priceInPence * quantityInt,
        currency: "GBP",
        metadata: { productId: product.id, quantity: quantityInt },
    });

    if (paymentIntent.client_secret == null) {
        throw Error("Stripe failed to create payment intent");
    }

    return (
        <CheckoutForm
            product={product}
            clientSecret={paymentIntent.client_secret}
            quantity={quantityInt}
        />
    );
}
