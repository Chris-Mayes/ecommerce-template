"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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

    const totalPrice = useMemo(() => {
        return products.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }, [products]);

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <h1 className="text-4xl font-bold">
                {isSuccess ? "Success!" : "Error!"}
            </h1>
            {products.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                    <div className="relative w-1/4 h-48 w-48">
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
            <div className="text-lg font-bold">
                {`Total: £${(totalPrice / 100).toFixed(2)}`}
            </div>
            <div className="">
                {isSuccess && (
                    <Link
                        href="/products"
                        className="flex items-center text-black"
                    >
                        <span className="align-middle">Continue Shopping</span>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="ml-2 w-6 h-6"
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}
