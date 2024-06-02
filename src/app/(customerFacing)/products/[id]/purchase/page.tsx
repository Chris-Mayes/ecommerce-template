"use client";

import { useEffect } from "react";
import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";
import { useCart } from "@/context/CartContext";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default function PurchasePage({
    params: { id },
    searchParams: { quantity, colour },
}: {
    params: { id: string };
    searchParams: { quantity?: string; colour?: string };
}) {
    const { addToCart, cart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            const product = await db.product.findUnique({ where: { id } });
            if (product == null) return notFound();

            const quantityInt = parseInt(quantity || "1", 10);
            const chosenColour = colour || "";

            if (quantityInt > product.availableQuantity) {
                return new Response(
                    "Requested quantity exceeds available stock",
                    {
                        status: 400,
                    }
                );
            }

            addToCart({
                productId: id,
                quantity: quantityInt,
                colour: chosenColour,
                productPrice: product.priceInPence,
                imagePath: product.imagePath,
                name: product.name,
            });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: product.priceInPence * quantityInt,
                currency: "GBP",
                metadata: {
                    productId: product.id,
                    quantity: quantityInt,
                    colour: chosenColour,
                },
            });

            if (paymentIntent.client_secret == null) {
                throw Error("Stripe failed to create payment intent");
            }

            return (
                <CheckoutForm
                    cart={[
                        {
                            productId: id,
                            quantity: quantityInt,
                            colour: chosenColour,
                            productPrice: product.priceInPence,
                            imagePath: product.imagePath,
                            name: product.name,
                        },
                    ]}
                    clientSecret={paymentIntent.client_secret}
                />
            );
        };

        fetchData();
    }, [id, quantity, colour, addToCart]);

    return <div>Loading...</div>;
}
