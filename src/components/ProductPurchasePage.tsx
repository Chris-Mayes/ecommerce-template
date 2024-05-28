// components/ProductPurchaseForm.tsx

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

    const handleQuantityChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(event.target.value);
        if (value > 0 && value <= availableQuantity) {
            setQuantity(value);
        } else if (value > availableQuantity) {
            setQuantity(availableQuantity);
        } else {
            setQuantity(1);
        }
    };

    const handleColourChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setColour(event.target.value);
    };

    const isAvailable = availableQuantity > 0;

    return (
        <div>
            <div className="mb-4">
                <Label htmlFor="quantity">Quantity</Label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="block w-full mt-1"
                    min="1"
                    max={availableQuantity}
                    disabled={!isAvailable}
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="colour">Colour</Label>
                <select
                    id="colour"
                    name="colour"
                    disabled={!isAvailable}
                    onChange={handleColourChange}
                    className="block w-full mt-1"
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
