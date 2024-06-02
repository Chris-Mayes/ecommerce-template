"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

export default function CartPage() {
    const { cart, updateCartItemQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const [availableQuantities, setAvailableQuantities] = useState<{
        [productId: string]: number;
    }>({});
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<string | null>(null); // Track which item to confirm removal
    const [isClient, setIsClient] = useState(false); // State to track if it's client-side

    useEffect(() => {
        setIsClient(true); // Set isClient to true when the component is mounted on the client side
    }, []);

    useEffect(() => {
        if (isClient) {
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
        }
    }, [isClient, cart]);

    const getTotalQuantityForProduct = (productId: string) => {
        return cart.reduce((total, item) => {
            return item.productId === productId ? total + item.quantity : total;
        }, 0);
    };

    const showAlert = (message: string) => {
        setAlertMessage(message);
        setTimeout(() => {
            setAlertMessage(null);
        }, 3000); // Hide alert after 3 seconds
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
            showAlert(
                `Cannot add more than ${availableQuantity} items of this product.`
            );
        } else if (quantity < 1) {
            showAlert("Quantity cannot be less than 1.");
        }
    };

    const handleRemoveItem = (productId: string, colour: string) => {
        removeFromCart(productId, colour);
        setShowConfirm(null); // Close the confirmation dialog
    };

    const totalPrice = cart.reduce(
        (total, item) => total + item.productPrice * item.quantity,
        0
    );

    if (!isClient) {
        return null; // Render nothing on the server side
    }

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <div className="space-y-4">
                {cart.map((item, index) => (
                    <div
                        key={index}
                        className="flex gap-5 pt-8 pb-8 items-center relative"
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
                                onClick={() =>
                                    setShowConfirm(item.productId + item.colour)
                                } // Unique key for each item
                                className="mt-2"
                            >
                                Remove
                            </Button>
                            {showConfirm === item.productId + item.colour && (
                                <div className="absolute top-0 left-0 bg-gray-100 border border-gray-300 rounded-md p-4 z-10">
                                    <p className="text-gray-700 mb-4">
                                        Are you sure you want to remove this
                                        item from the cart?
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() =>
                                                handleRemoveItem(
                                                    item.productId,
                                                    item.colour
                                                )
                                            }
                                            className="bg-red-600 text-white"
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            onClick={() => setShowConfirm(null)}
                                            className="bg-gray-300"
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                            )}
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
            <Transition
                show={!!alertMessage}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed bottom-4 left-4 p-4 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                    {alertMessage}
                </div>
            </Transition>
        </div>
    );
}
