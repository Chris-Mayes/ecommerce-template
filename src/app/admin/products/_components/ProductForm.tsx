"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Product, Colour } from "@prisma/client";
import Image from "next/image";

type ProductWithColours = Product & {
    colours: Colour[];
};

export function ProductForm({
    product,
}: {
    product?: ProductWithColours | null;
}) {
    const [error, action] = useFormState(
        product == null ? addProduct : updateProduct.bind(null, product.id),
        {}
    );
    const [priceInPence, setPriceInPence] = useState<number | undefined>(
        product?.priceInPence
    );
    const [colours, setColours] = useState<string[]>(
        product?.colours?.map((c) => c.name) || []
    );
    const [newColour, setNewColour] = useState<string>("");

    const addColour = () => {
        if (newColour && !colours.includes(newColour)) {
            setColours([...colours, newColour]);
            setNewColour("");
        }
    };

    return (
        <form action={action} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={product?.name || ""}
                />
                {error.name && (
                    <div className="text-destructive">{error.name}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="priceInPence">Price In Pence</Label>
                <Input
                    type="number"
                    id="priceInPence"
                    name="priceInPence"
                    required
                    value={priceInPence}
                    onChange={(e) =>
                        setPriceInPence(Number(e.target.value) || undefined)
                    }
                />
                <div className="text-muted-foreground">
                    {formatCurrency((priceInPence || 0) / 100)}
                </div>
                {error.priceInPence && (
                    <div className="text-destructive">{error.priceInPence}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={product?.description}
                />
                {error.description && (
                    <div className="text-destructive">{error.description}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                    type="file"
                    id="file"
                    name="file"
                    required={product == null}
                />
                {product != null && (
                    <div className="text-muted-foreground">
                        {product.filePath}
                    </div>
                )}
                {error.file && (
                    <div className="text-destructive">{error.file}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                    type="file"
                    id="image"
                    name="image"
                    required={product == null}
                />
                {product != null && (
                    <Image
                        src={product.imagePath}
                        height="400"
                        width="400"
                        alt="Product Image"
                    />
                )}
                {error.image && (
                    <div className="text-destructive">{error.image}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="colours">Colours</Label>
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        id="colours"
                        name="colours"
                        value={newColour}
                        onChange={(e) => setNewColour(e.target.value)}
                    />
                    <Button type="button" onClick={addColour}>
                        Add Colour
                    </Button>
                </div>
                <div className="space-y-2">
                    {colours.map((colour, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-2"
                        >
                            <span>{colour}</span>
                            <Button
                                type="button"
                                onClick={() =>
                                    setColours(
                                        colours.filter((c) => c !== colour)
                                    )
                                }
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
                {/* Hidden input to pass colours */}
                <input
                    type="hidden"
                    name="colours"
                    value={JSON.stringify(colours)}
                />
            </div>

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
        </Button>
    );
}
