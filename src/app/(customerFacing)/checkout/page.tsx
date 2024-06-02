"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { CheckoutForm } from "../products/[id]/purchase/_components/CheckoutForm";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && cart.length > 0) {
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
    }, [isHydrated, cart]);

    if (!isHydrated) {
        return <div>Loading...</div>;
    }

    if (cart.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    if (!clientSecret) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Button onClick={clearCart} className="mb-4">
                Clear Cart
            </Button>
            <CheckoutForm cart={cart} clientSecret={clientSecret} />
        </div>
    );
}
