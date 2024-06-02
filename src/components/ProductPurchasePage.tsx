"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useCart } from "@/context/CartContext";

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

    const handleAddToCart = () => {
        const itemInCart = cart.find(
            (item) => item.productId === productId && item.colour === colour
        );

        const totalQuantityInCart = cart
            .filter((item) => item.productId === productId)
            .reduce((total, item) => total + item.quantity, 0);

        if (totalQuantityInCart + quantity > availableQuantity) {
            alert(
                `Cannot add more than ${availableQuantity} items of this product.`
            );
        } else if (itemInCart) {
            alert("This configuration is already in the cart.");
        } else {
            addToCart({
                productId,
                quantity,
                colour,
                productPrice,
                imagePath,
                name,
            });
            alert("Product added to cart!");
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
            <div className="mb-4">
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
                className="w-full"
            >
                {isAvailable ? "Add to Cart" : "Out of Stock"}
            </Button>
        </div>
    );
}
