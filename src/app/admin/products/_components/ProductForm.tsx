"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { Product, Image as ImageType } from "@prisma/client";

type ProductWithColoursAndCategories = Product & {
    colours: { id: string; globalColour: { id: string; name: string } }[];
    categories: { id: string; globalCategory: { id: string; name: string } }[];
    images: ImageType[];
};

type FormErrors =
    | {
          [key: string]: string[] | undefined;
      }
    | {
          name?: string[];
          description?: string[];
          priceInPence?: string[];
          availableQuantity?: string[];
          lengthInMm?: string[];
          widthInMm?: string[];
          heightInMm?: string[];
          file?: string[];
          colours?: string[];
          categories?: string[];
          images?: string[];
      };

export function ProductForm({
    product,
}: {
    product?: ProductWithColoursAndCategories | null;
}) {
    const [error, action, state] = useFormState(
        product == null
            ? addProduct
            : updateProduct.bind(null, product?.id || ""),
        {}
    ) as [FormErrors | undefined, (formData: FormData) => void, unknown];

    const [priceInPence, setPriceInPence] = useState<number | undefined>(
        product?.priceInPence
    );
    const [availableQuantity, setAvailableQuantity] = useState<
        number | undefined
    >(product?.availableQuantity);
    const [colours, setColours] = useState<string[]>(
        product?.colours?.map((c) => c.globalColour.id) || []
    );
    const [categories, setCategories] = useState<string | null>(
        product?.categories?.[0]?.globalCategory?.id || null
    );
    const [lengthInMm, setLengthInMm] = useState<number | undefined>(
        product?.lengthInMm
    );
    const [widthInMm, setWidthInMm] = useState<number | undefined>(
        product?.widthInMm
    );
    const [heightInMm, setHeightInMm] = useState<number | undefined>(
        product?.heightInMm
    );
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(
        product?.images?.map((image) => image.url) || []
    );

    const [availableColours, setAvailableColours] = useState<
        { value: string; label: string }[]
    >([]);
    const [availableCategories, setAvailableCategories] = useState<
        { value: string; label: string }[]
    >([]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [imagePreviews]);

    useEffect(() => {
        async function fetchAvailableColours() {
            const res = await fetch("/api/colours");
            const data = await res.json();
            setAvailableColours(
                data.map((colour: { id: string; name: string }) => ({
                    value: colour.id,
                    label: colour.name,
                }))
            );
        }
        fetchAvailableColours();
    }, []);

    useEffect(() => {
        async function fetchAvailableCategories() {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setAvailableCategories(
                data.map((category: { id: string; name: string }) => ({
                    value: category.id,
                    label: category.name,
                }))
            );
        }
        fetchAvailableCategories();
    }, []);

    useEffect(() => {
        if (product && product.colours) {
            setColours(product.colours.map((c) => c.globalColour.id));
        }
        if (product && product.categories) {
            setCategories(product.categories[0]?.globalCategory.id || null);
        }
    }, [product]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setImages((prev) => [...prev, ...acceptedFiles]);
        const newPreviews = acceptedFiles.map((file) =>
            URL.createObjectURL(file)
        );
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif"],
        },
    });

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                images.forEach((image) => {
                    formData.append("images", image);
                });
                formData.append("colours", JSON.stringify(colours));
                if (categories) {
                    formData.append("categories", JSON.stringify([categories]));
                }
                action(formData);
            }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={product?.name || ""}
                />
                {error?.name && (
                    <div className="text-destructive">
                        {error.name.join(", ")}
                    </div>
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
                {error?.priceInPence && (
                    <div className="text-destructive">
                        {error.priceInPence.join(", ")}
                    </div>
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
                {error?.description && (
                    <div className="text-destructive">
                        {error.description.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="lengthInMm">Length (mm)</Label>
                <Input
                    type="number"
                    id="lengthInMm"
                    name="lengthInMm"
                    required
                    value={lengthInMm}
                    onChange={(e) =>
                        setLengthInMm(Number(e.target.value) || undefined)
                    }
                />
                {error?.lengthInMm && (
                    <div className="text-destructive">
                        {error.lengthInMm.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="widthInMm">Width (mm)</Label>
                <Input
                    type="number"
                    id="widthInMm"
                    name="widthInMm"
                    required
                    value={widthInMm}
                    onChange={(e) =>
                        setWidthInMm(Number(e.target.value) || undefined)
                    }
                />
                {error?.widthInMm && (
                    <div className="text-destructive">
                        {error.widthInMm.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="heightInMm">Height (mm)</Label>
                <Input
                    type="number"
                    id="heightInMm"
                    name="heightInMm"
                    required
                    value={heightInMm}
                    onChange={(e) =>
                        setHeightInMm(Number(e.target.value) || undefined)
                    }
                />
                {error?.heightInMm && (
                    <div className="text-destructive">
                        {error.heightInMm.join(", ")}
                    </div>
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
                {error?.file && (
                    <div className="text-destructive">
                        {error.file.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <div {...getRootProps({ className: "dropzone" })}>
                    <input {...getInputProps()} />
                    <p>
                        Drag 'n' drop some files here, or click to select files
                    </p>
                </div>
                <div className="flex space-x-2 mt-2">
                    {imagePreviews.map((src, index) => (
                        <Image
                            key={index}
                            src={src}
                            height={100}
                            width={100}
                            alt="Product Image Preview"
                            className="border p-1"
                        />
                    ))}
                </div>
                {error?.images && (
                    <div className="text-destructive">
                        {error.images.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="colours">Colours</Label>
                <div className="flex flex-wrap space-x-2">
                    {availableColours.map((colour) => (
                        <Button
                            key={colour.value}
                            type="button"
                            variant={
                                colours.includes(colour.value)
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                setColours((prev) =>
                                    prev.includes(colour.value)
                                        ? prev.filter((c) => c !== colour.value)
                                        : [...prev, colour.value]
                                )
                            }
                        >
                            {colour.label}
                        </Button>
                    ))}
                </div>
                {error?.colours && (
                    <div className="text-destructive">
                        {error.colours.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="categories">Categories</Label>
                <div className="flex flex-wrap space-x-2">
                    {availableCategories.map((category) => (
                        <Button
                            key={category.value}
                            type="button"
                            variant={
                                categories === category.value
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => setCategories(category.value)}
                        >
                            {category.label}
                        </Button>
                    ))}
                </div>
                {error?.categories && (
                    <div className="text-destructive">
                        {error.categories.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="availableQuantity">Available Quantity</Label>
                <Input
                    type="number"
                    id="availableQuantity"
                    name="availableQuantity"
                    required
                    value={availableQuantity}
                    onChange={(e) =>
                        setAvailableQuantity(
                            Number(e.target.value) || undefined
                        )
                    }
                />
                {error?.availableQuantity && (
                    <div className="text-destructive">
                        {error.availableQuantity.join(", ")}
                    </div>
                )}
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
