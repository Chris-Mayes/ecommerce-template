"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
    LinkAuthenticationElement,
    AddressElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

interface CartItem {
    productId: string;
    quantity: number;
    colour: string;
    productPrice: number;
    imagePath: string;
    name: string;
}

type CheckoutFormProps = {
    cart: CartItem[];
    clientSecret: string;
};

export function CheckoutForm({ cart, clientSecret }: CheckoutFormProps) {
    const totalPrice = cart.reduce(
        (total, item) => total + item.productPrice * item.quantity,
        0
    );

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
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
                                fill
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{item.name}</h1>
                            <div>Colour: {item.colour}</div>
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
            <div className="text-left text-lg font-bold">
                Total: £{(totalPrice / 100).toFixed(2)}
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm totalPrice={totalPrice} />
            </Elements>
        </div>
    );
}

const PaymentForm = ({ totalPrice }: { totalPrice: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { clearCart } = useCart();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (stripe == null || elements == null || email == null) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
            },
        });

        if (error) {
            if (
                error.type === "card_error" ||
                error.type === "validation_error"
            ) {
                setErrorMessage(error.message ?? "An unknown error occurred");
            } else {
                setErrorMessage("An unknown error occurred");
            }
        } else {
            clearCart();
            setTimeout(() => {
                router.push("/stripe/purchase-success");
            }, 500);
        }
        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Payment</CardTitle>
                    <CardDescription>
                        Enter your payment details below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LinkAuthenticationElement
                        id="link-authentication-element"
                        onChange={(e) => setEmail(e.value.email)}
                    />
                    <PaymentElement id="payment-element" />
                    <AddressElement options={{ mode: "shipping" }} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={!stripe || isLoading}>
                        {isLoading
                            ? "Processing..."
                            : `Pay £${(totalPrice / 100).toFixed(2)}`}
                    </Button>
                </CardFooter>
            </Card>
            {errorMessage && (
                <div className="text-red-500 mt-4">{errorMessage}</div>
            )}
        </form>
    );
};
