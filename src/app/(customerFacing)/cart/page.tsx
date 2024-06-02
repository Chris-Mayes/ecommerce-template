"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { cart, updateCartItemQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const [availableQuantities, setAvailableQuantities] = useState<{
        [productId: string]: number;
    }>({});

    useEffect(() => {
        const fetchAvailableQuantities = async () => {
            const quantities: { [productId: string]: number } = {};

            for (const item of cart) {
                if (!quantities[item.productId]) {
                    const response = await fetch(
                        `/api/get-product-quantity?productId=${item.productId}`
                    );
                    const data = await response.json();
                    quantities[item.productId] = data.availableQuantity;
                }
            }

            setAvailableQuantities(quantities);
        };

        fetchAvailableQuantities();
    }, [cart]);

    const getTotalQuantityForProduct = (productId: string) => {
        return cart.reduce((total, item) => {
            return item.productId === productId ? total + item.quantity : total;
        }, 0);
    };

    const handleQuantityChange = (
        productId: string,
        colour: string,
        quantity: number
    ) => {
        const availableQuantity = availableQuantities[productId] || 0;
        const cartItem = cart.find(
            (item) => item.productId === productId && item.colour === colour
        );
        const currentItemQuantity = cartItem?.quantity || 0;
        const newTotalQuantity =
            getTotalQuantityForProduct(productId) +
            quantity -
            currentItemQuantity;

        if (quantity > 0 && newTotalQuantity <= availableQuantity) {
            updateCartItemQuantity(productId, colour, quantity);
        } else if (quantity > 0) {
            alert(
                `Cannot add more than ${availableQuantity} items of this product.`
            );
        } else if (quantity < 1) {
            alert("Quantity cannot be less than 1.");
        }
    };

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
                            <div className="flex items-center">
                                <Button
                                    onClick={() =>
                                        handleQuantityChange(
                                            item.productId,
                                            item.colour,
                                            item.quantity - 1
                                        )
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button
                                    onClick={() =>
                                        handleQuantityChange(
                                            item.productId,
                                            item.colour,
                                            item.quantity + 1
                                        )
                                    }
                                >
                                    +
                                </Button>
                            </div>
                            <Button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Are you sure you want to remove this item from the cart?"
                                        )
                                    ) {
                                        removeFromCart(
                                            item.productId,
                                            item.colour
                                        );
                                    }
                                }}
                                className="mt-2"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-left text-lg font-bold">
                Total: £{(totalPrice / 100).toFixed(2)}
            </div>
            <div className="pb-20">
                <Button
                    onClick={() => router.push("/checkout")}
                    className="mt-4"
                >
                    Proceed to checkout
                </Button>
            </div>
        </div>
    );
}
