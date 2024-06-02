"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "../products/[id]/purchase/_components/CheckoutForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function CheckoutPage() {
    const { cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (cart.length > 0) {
            const createPaymentIntent = async () => {
                try {
                    const response = await fetch("/api/create-payment-intent", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ cart }),
                    });

                    const data = await response.json();
                    setClientSecret(data.clientSecret);
                } catch (error) {
                    console.error("Failed to create payment intent:", error);
                }
            };

            createPaymentIntent();
        }
    }, [cart]);

    if (cart.length === 0) {
        return <div>Your basket is empty.</div>;
    }

    if (!clientSecret) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <Button onClick={() => router.push("/cart")} className="mb-4">
                Return to Basket
            </Button>
            <div className="space-y-4">
                {cart.map((item, index) => (
                    <div
                        key={index}
                        className="flex gap-5 pt-8 pb-8 items-center"
                    >
                        <div className="relative w-1/4 h-56">
                            <Image
                                src={item.imagePath}
                                alt={item.name}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{item.name}</h1>
                            <div>Colour: {item.colour}</div>
                            <div>Quantity: {item.quantity}</div>
                            <div>
                                Price: £
                                {(
                                    (item.productPrice * item.quantity) /
                                    100
                                ).toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <CheckoutForm cart={cart} clientSecret={clientSecret} />
        </div>
    );
}
