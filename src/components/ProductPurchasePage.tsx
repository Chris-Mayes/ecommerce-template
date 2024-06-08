"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useCart } from "@/context/CartContext";
import { Transition } from "@headlessui/react";

interface Colour {
    id: string;
    name: string;
}

interface ProductPurchaseFormProps {
    productId: string;
    productPrice: number;
    colours: Colour[];
    availableQuantity: number;
    imagePath: string;
    name: string;
}

export default function ProductPurchaseForm({
    productId,
    productPrice,
    colours,
    availableQuantity,
    imagePath,
    name,
}: ProductPurchaseFormProps) {
    const [quantity, setQuantity] = useState(1);
    const [colour, setColour] = useState(colours[0]?.name || "");
    const { addToCart, cart } = useCart();
    const [alertMessages, setAlertMessages] = useState<string[]>([]);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleQuantityChange = (value: number) => {
        if (value > 0 && value <= availableQuantity) {
            setQuantity(value);
        }
    };

    const handleColourChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setColour(event.target.value);
    };

    const isAvailable = availableQuantity > 0;

    const showAlert = (message: string) => {
        if (message !== "Added to basket!") {
            setAlertMessages((prevMessages) =>
                prevMessages.filter((msg) => msg === "Added to basket!")
            );
        }

        setAlertMessages((prevMessages) => [...prevMessages, message]);

        alertTimeoutRef.current = setTimeout(() => {
            setAlertMessages((prevMessages) =>
                prevMessages.filter((msg) => msg !== message)
            );
        }, 4000); // Hide alert after 4 seconds
    };

    const handleAddToCart = () => {
        const itemInCart = cart.find(
            (item) => item.productId === productId && item.colour === colour
        );

        const totalQuantityInCart = cart
            .filter((item) => item.productId === productId)
            .reduce((total, item) => total + item.quantity, 0);

        if (totalQuantityInCart + quantity > availableQuantity) {
            showAlert(
                `You have ${totalQuantityInCart} in your basket. Adding ${quantity} more exceeds our available quantity!`
            );
        } else if (itemInCart) {
            showAlert("This colour is already in your basket!");
        } else {
            addToCart({
                productId,
                quantity,
                colour,
                productPrice,
                imagePath,
                name,
            });
            showAlert("Added to basket!");
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700"
                ></Label>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        disabled={quantity <= 1}
                    >
                        -
                    </button>
                    <input
                        type="text"
                        id="quantity"
                        className="w-12 px-3 py-2 border-t border-b border-gray-300 shadow-sm text-center"
                        value={quantity}
                        readOnly
                    />
                    <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-3 py-2 border border-gray-300 rounded-r-md shadow-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        disabled={quantity >= availableQuantity}
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="w-2/3">
                <Label
                    htmlFor="colour"
                    className="block text-sm font-medium text-gray-700"
                >
                    Colour:
                </Label>
                <select
                    id="colour"
                    name="colour"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={colour}
                    onChange={handleColourChange}
                >
                    {colours.map((colour) => (
                        <option key={colour.id} value={colour.name}>
                            {colour.name}
                        </option>
                    ))}
                </select>
            </div>
            <Button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-2/3"
            >
                {isAvailable ? "Add to Cart" : "Out of Stock"}
            </Button>
            <div className="space-y-2 mt-4 w-2/3">
                {alertMessages.map((message, index) => (
                    <Transition
                        key={index}
                        show={!!message}
                        enter="transition-opacity duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="p-4 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                            {message}
                        </div>
                    </Transition>
                ))}
            </div>
        </div>
    );
}
