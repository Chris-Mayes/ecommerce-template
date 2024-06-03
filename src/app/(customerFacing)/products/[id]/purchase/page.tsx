"use client";

import { useEffect, useState } from "react";
import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";
import { useCart } from "@/context/CartContext";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type ProductInCart = {
    productId: string;
    quantity: number;
    colour: string;
    productPrice: number;
    imagePath: string;
    name: string;
};

export default function PurchasePage({
    params: { id },
    searchParams: { quantity, colour },
}: {
    params: { id: string };
    searchParams: { quantity?: string; colour?: string };
}) {
    const { addToCart, cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [productInCart, setProductInCart] = useState<ProductInCart | null>(
        null
    );

    useEffect(() => {
        const fetchData = async () => {
            const product = await db.product.findUnique({
                where: { id },
                include: { images: true },
            });
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

            const imageUrl =
                product.images[0]?.url || "/default-image-path.jpg";

            const productToAdd = {
                productId: id,
                quantity: quantityInt,
                colour: chosenColour,
                productPrice: product.priceInPence,
                imagePath: imageUrl,
                name: product.name,
            };

            addToCart(productToAdd);
            setProductInCart(productToAdd);

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

            setClientSecret(paymentIntent.client_secret);
        };

        fetchData();
    }, [id, quantity, colour, addToCart]);

    if (!clientSecret) {
        return <div>Loading...</div>;
    }

    return (
        <CheckoutForm
            cart={productInCart ? [productInCart] : []}
            clientSecret={clientSecret}
        />
    );
}
