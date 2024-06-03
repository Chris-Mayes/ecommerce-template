"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Product {
    productId: string;
    quantity: number;
    colour: string;
    price: number;
    name: string;
    description: string;
    imagePath: string;
}

interface SuccessPageClientProps {
    products: Product[];
    isSuccess: boolean;
}

export default function SuccessPageClient({
    products,
    isSuccess,
}: SuccessPageClientProps) {
    const { clearCart } = useCart();

    useEffect(() => {
        if (isSuccess) {
            clearCart();
        }
    }, [isSuccess]);

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
                            {`£${((item.price * item.quantity) / 100).toFixed(
                                2
                            )}`}
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
                {isSuccess && (
                    <Button className="mt-4" size="lg" asChild>
                        <Link href={`/products`}>Continue Shopping</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
