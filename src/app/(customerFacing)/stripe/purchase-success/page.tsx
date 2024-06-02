import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import SuccessPageClient from "./SuccessPageClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: { payment_intent: string };
}) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
        searchParams.payment_intent
    );

    if (paymentIntent.metadata.cartId == null) return notFound();

    const cart = await db.activeCart.findUnique({
        where: { id: paymentIntent.metadata.cartId },
        include: { items: true },
    });

    if (!cart) return notFound();

    const products = await Promise.all(
        cart.items.map(async (item) => {
            const product = await db.product.findUnique({
                where: { id: item.productId },
            });
            return {
                ...item,
                name: product?.name ?? "Unknown Product",
                description: product?.description ?? "No description available",
                imagePath: product?.imagePath ?? "/default-image-path.jpg",
            };
        })
    );

    const isSuccess = paymentIntent.status === "succeeded";

    return <SuccessPageClient products={products} isSuccess={isSuccess} />;
}
