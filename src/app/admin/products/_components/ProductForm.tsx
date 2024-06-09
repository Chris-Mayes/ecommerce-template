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
import { useRouter } from "next/navigation";

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
    const router = useRouter();
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
        product?.lengthInMm ?? undefined
    );
    const [widthInMm, setWidthInMm] = useState<number | undefined>(
        product?.widthInMm ?? undefined
    );
    const [heightInMm, setHeightInMm] = useState<number | undefined>(
        product?.heightInMm ?? undefined
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        const uploadPromises = images.map(async (image) => {
            const imageData = new FormData();
            imageData.append("file", image);
            const response = await fetch("/api/upload", {
                method: "POST",
                body: imageData,
            });
            const data = await response.json();
            return data.url;
        });

        try {
            const uploadedImageUrls = await Promise.all(uploadPromises);
            formData.append("images", JSON.stringify(uploadedImageUrls));
            action(formData);
        } catch (error) {
            console.error("Error uploading images:", error);
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="name">Name - Required</Label>
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
                <Label htmlFor="priceInPence">Price In Pence - Required</Label>
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
                <Label htmlFor="description">Description - Required</Label>
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
                <p>
                    <i>
                        Note: Leave all dimension fields blank or 0 to exclude
                        from product page
                    </i>
                </p>

                <Label htmlFor="lengthInMm">Length (mm) - Not required</Label>
                <Input
                    type="number"
                    id="lengthInMm"
                    name="lengthInMm"
                    value={lengthInMm !== undefined ? lengthInMm : ""}
                    onChange={(e) =>
                        setLengthInMm(
                            e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                        )
                    }
                />
                {error?.lengthInMm && (
                    <div className="text-destructive">
                        {error.lengthInMm.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="widthInMm">Width (mm) - Not required</Label>
                <Input
                    type="number"
                    id="widthInMm"
                    name="widthInMm"
                    value={widthInMm !== undefined ? widthInMm : ""}
                    onChange={(e) =>
                        setWidthInMm(
                            e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                        )
                    }
                />
                {error?.widthInMm && (
                    <div className="text-destructive">
                        {error.widthInMm.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="heightInMm">Height (mm) - Not required</Label>
                <Input
                    type="number"
                    id="heightInMm"
                    name="heightInMm"
                    value={heightInMm !== undefined ? heightInMm : ""}
                    onChange={(e) =>
                        setHeightInMm(
                            e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                        )
                    }
                />
                {error?.heightInMm && (
                    <div className="text-destructive">
                        {error.heightInMm.join(", ")}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="file">File - Required</Label>
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
                <Label htmlFor="images">Images - Required</Label>
                <div {...getRootProps({ className: "dropzone" })}>
                    <input {...getInputProps()} />
                    <p>Drag images here, or click to select files</p>
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
                <Label htmlFor="colours">Colours - Required (at least 1)</Label>
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
                <Label htmlFor="categories">Categories - Required</Label>
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
                <Label htmlFor="availableQuantity">
                    Available Quantity - Required
                </Label>
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
            <div className="space-x-4">
                <SubmitButton />
                <Button onClick={() => router.back()}>
                    Back - Don&apos;t Save
                </Button>
            </div>
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
