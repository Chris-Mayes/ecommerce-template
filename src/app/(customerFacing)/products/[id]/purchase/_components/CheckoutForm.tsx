"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
    Elements,
    LinkAuthenticationElement,
    PaymentElement,
    AddressElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useState } from "react";

type CheckoutFormProps = {
    product: {
        id: string;
        imagePath: string;
        name: string;
        priceInPence: number;
        description: string;
    };
    clientSecret: string;
    quantity: number;
    colour: string;
};

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export function CheckoutForm({
    product,
    clientSecret,
    quantity,
    colour,
}: CheckoutFormProps) {
    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <div className="flex gap-5 pt-8 pb-8 items-center">
                <div className="relative w-1/4 h-56">
                    <Image
                        src={product.imagePath}
                        layout="fill"
                        objectFit="contain"
                        alt={product.name}
                    />
                </div>
                <div>
                    <div className="text-lg">
                        {formatCurrency(
                            (product.priceInPence * quantity) / 100
                        )}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                    <div className="line-clamp-3 text-muted-foreground">
                        Quantity: {quantity}
                    </div>
                    <div className="line-clamp-3 text-muted-foreground">
                        Colour: {colour}
                    </div>
                </div>
            </div>
            <Elements options={{ clientSecret }} stripe={stripePromise}>
                <Form
                    priceInPence={product.priceInPence}
                    productId={product.id}
                    quantity={quantity}
                    colour={colour}
                />
            </Elements>
        </div>
    );
}

function Form({
    priceInPence,
    productId,
    quantity,
    colour,
}: {
    priceInPence: number;
    productId: string;
    quantity: number;
    colour: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [email, setEmail] = useState<string>();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (stripe == null || elements == null || email == null) return;

        setIsLoading(true);

        stripe
            .confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
                },
            })
            .then(({ error }) => {
                if (
                    error.type === "card_error" ||
                    error.type === "validation_error"
                ) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("An unknown error occurred");
                }
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    {errorMessage && (
                        <CardDescription className="text-destructive">
                            {errorMessage}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                    <div className="mt-4">
                        <LinkAuthenticationElement
                            onChange={(e) => setEmail(e.value.email)}
                        />
                    </div>
                    <div>
                        <AddressElement
                            options={{
                                mode: "shipping",
                            }}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={
                            stripe == null || elements == null || isLoading
                        }
                    >
                        {isLoading
                            ? "Purchasing..."
                            : `Purchase - ${formatCurrency(
                                  (priceInPence * quantity) / 100
                              )}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
