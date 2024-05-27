"use client";
import { userOrderExists } from "@/app/actions/orders";
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
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useState } from "react";

type CheckoutFormProps = {
    configproduct:{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        purchasequantity: number;
        productId: string;
        Colour:string;
    };
    product: {
        id: string;
        imagePath: string;
        name: string;
        priceInPence: number;
        description: string;
    };
    clientSecret: string;
};

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export function CheckoutForm({ product,configproduct, clientSecret }: CheckoutFormProps) {
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
                        {formatCurrency(product.priceInPence * configproduct.purchasequantity / 100)}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                    <div className="line-clamp-3 text-muted-foreground">
                        Quantity: {configproduct.purchasequantity}
                    </div>
                    <div className="line-clamp-3 text-muted-foreground">
                        Colour: {configproduct.Colour}
                    </div>
                </div>
            </div>
            <Elements options={{ clientSecret }} stripe={stripePromise}>
                <Form
                    priceInPence={product.priceInPence * configproduct.purchasequantity}
                    productId={product.id}
                />
            </Elements>
        </div>
    );
}

function Form({
    priceInPence,
    productId,
}: {
    priceInPence: number;
    productId: string;
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

        const orderExists = await userOrderExists(email, productId);

        if (orderExists) {
            setErrorMessage(
                "You have already purchased this product. Try downloading it from the My Orders page"
            );
            setIsLoading(false);
            return;
        }

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
                }
                 else {
                    setErrorMessage(error.message);
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
                                  priceInPence / 100
                              )}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
