"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "../products/[id]/purchase/_components/CheckoutForm";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function CheckoutPage() {
    const { cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && cart.length > 0) {
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
    }, [isClient, cart]);

    if (!isClient) {
        return null;
    }

    if (cart.length === 0) {
        return <div>Your basket is empty.</div>;
    }

    if (!clientSecret) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <Link href="/products" className="flex items-center text-black">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 w-6 h-6" />
                <span className="align-middle">Back to Products</span>
            </Link>
            <div className="space-y-4">
                {cart.map((item, index) => (
                    <div
                        key={index}
                        className="flex gap-5 pt-1 pb-1 items-center"
                    >
                        <div className="relative w-1/4 h-56">
                            <Image
                                src={item.imagePath}
                                alt={item.name}
                                fill
                                style={{ objectFit: "contain" }}
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
