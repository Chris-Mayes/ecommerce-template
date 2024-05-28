// components/ProductPurchaseForm.tsx

"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Link from "next/link";

interface ProductPurchaseFormProps {
    productId: string;
    productPrice: number;
}

export default function ProductPurchaseForm({
    productId,
    productPrice,
}: ProductPurchaseFormProps) {
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(event.target.value);
        if (value > 0) {
            setQuantity(value);
        }
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
            <p className="text-lg font-semibold mb-4">
                {`Total: £${((productPrice * quantity) / 100).toFixed(2)}`}
            </p>
            <Button
                asChild
                size="lg"
                className="w-auto max-w-xs self-start --primary-buttons"
            >
                <Link
                    href={`/products/${productId}/purchase?quantity=${quantity}`}
                >
                    Purchase
                </Link>
            </Button>
        </div>
    );
}
