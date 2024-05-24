import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
    params: { id },
}: {
    params: { id: string };
}) {
    //we want to get the ID from the last form and use it to get the configured product that we created. The configured product id needs to be passed from the purchase page instead of the product id which is what we currently pass.

    const configproduct = await db.configuredProduct.findUnique({ where: { id } })
    if (configproduct == null) return notFound();
    let val = configproduct.productId
    const product = await db.product.findUnique({ where: { id: val } })
    
    if (product == null) return notFound();
    

    const paymentIntent = await stripe.paymentIntents.create({
        amount: product.priceInPence * configproduct.purchasequantity,
        currency: "GBP",
        metadata: { productId: product.id },
    });

    if (paymentIntent.client_secret == null) {
        throw Error("Stripe failed to create payment intent");
    }

    return (
        <CheckoutForm
            configproduct={configproduct}
            product={product}
            clientSecret={paymentIntent.client_secret}
        />
    );
}
