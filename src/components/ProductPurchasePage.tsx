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
}

export default function ProductPurchaseForm({
    productId,
    productPrice,
    colours,
}: ProductPurchaseFormProps) {
    const [quantity, setQuantity] = useState(1);
    const [colour, setColour] = useState(colours[0]?.name || "");

    const handleQuantityChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(event.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const handleColourChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setColour(event.target.value);
    };

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
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="colour">Colour</Label>
                <select
                    id="colour"
                    name="colour"
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
        </div>
    );
}
