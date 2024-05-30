"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Link from "next/link";

interface Colour {
    id: string;
    name: string;
}

interface ProductPurchaseFormProps {
    productId: string;
    productPrice: number;
    colours: Colour[];
    availableQuantity: number;
}

export default function ProductPurchaseForm({
    productId,
    productPrice,
    colours,
    availableQuantity,
}: ProductPurchaseFormProps) {
    const [quantity, setQuantity] = useState(1);
    const [colour, setColour] = useState(colours[0]?.name || "");

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
                        className="px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isAvailable || quantity <= 1}
                    >
                        -
                    </button>
                    <div
                        className="block w-16 text-center mt-1 px-3 py-2 border-t border-b border-gray-300 shadow-sm bg-white sm:text-sm"
                        style={{ pointerEvents: "none" }}
                    >
                        {quantity}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-3 py-2 border border-gray-300 rounded-r-md shadow-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isAvailable || quantity >= availableQuantity}
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
                    Colour
                </Label>
                <select
                    id="colour"
                    name="colour"
                    value={colour}
                    onChange={handleColourChange}
                    disabled={!isAvailable}
                    className="block w-1/2 mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {colours.map((colour) => (
                        <option key={colour.id} value={colour.name}>
                            {colour.name}
                        </option>
                    ))}
                </select>
            </div>
            <p className="text-lg font-semibold mb-4">
                {`Total: £${((productPrice * quantity) / 100).toFixed(2)}`}
            </p>
            {isAvailable ? (
                <Button
                    asChild
                    size="lg"
                    className="w-auto max-w-xs self-start --primary-buttons"
                >
                    <Link
                        href={`/products/${productId}/purchase?quantity=${quantity}&colour=${colour}`}
                    >
                        Purchase
                    </Link>
                </Button>
            ) : (
                <Button
                    size="lg"
                    className="w-auto max-w-xs self-start --primary-buttons"
                    disabled
                >
                    Unavailable
                </Button>
            )}
        </div>
    );
}
