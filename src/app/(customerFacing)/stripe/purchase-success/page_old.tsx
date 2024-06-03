"use client";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

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

    const cart = await db.cart.findUnique({
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

    // Clear cart on success page load
    const { clearCart } = useCart();
    useEffect(() => {
        if (isSuccess) {
            clearCart();
        }
    }, [isSuccess, clearCart]);

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <h1 className="text-4xl font-bold">
                {isSuccess ? "Success!" : "Error!"}
            </h1>
            {products.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                    <div className="relative w-1/4 h-64">
                        <Image
                            src={item.imagePath}
                            fill
                            alt={item.name}
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="text-lg">
                            {`£${(item.price / 100).toFixed(2)}`}
                        </div>
                        <h1 className="text-2xl font-bold">{item.name}</h1>
                        <div className="line-clamp-3 text-muted-foreground">
                            Quantity: {item.quantity}
                        </div>
                        <div className="line-clamp-3 text-muted-foreground">
                            Colour: {item.colour}
                        </div>
                    </div>
                </div>
            ))}
            <div>
                {" "}
                {isSuccess && (
                    <Button className="mt-4" size="lg" asChild>
                        <Link href={`/products`}>Continue Shopping</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
