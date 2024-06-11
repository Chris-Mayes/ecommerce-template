"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File).optional();

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInPence: z.coerce.number().int().min(1),
    availableQuantity: z.coerce.number().int().min(0),
    lengthInMm: z.coerce.number().int().optional().nullable(),
    widthInMm: z.coerce.number().int().optional().nullable(),
    heightInMm: z.coerce.number().int().optional().nullable(),
    file: fileSchema,
    colours: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, "Invalid colours format"),
    categories: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, "Invalid categories format"),
    imageUrls: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return Array.isArray(JSON.parse(val));
        } catch {
            return false;
        }
    }, "Invalid imageUrls format"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
    const entries = Object.fromEntries(formData.entries());

    const result = addSchema.safeParse(entries);
    if (result.success === false) {
        console.error("Validation failed", result.error.formErrors.fieldErrors);
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);
    const categories = JSON.parse(data.categories);
    const imageUrls = JSON.parse(data.imageUrls);

    const product = await db.product.create({
        data: {
            isAvailableForPurchase: false,
            name: data.name,
            description: data.description,
            priceInPence: data.priceInPence,
            availableQuantity: data.availableQuantity,
            lengthInMm: data.lengthInMm ?? null,
            widthInMm: data.widthInMm ?? null,
            heightInMm: data.heightInMm ?? null,
            filePath: data.file?.name || "",
        },
    });

    for (const colour of colours) {
        await db.productColour.create({
            data: {
                productId: product.id,
                globalColourId: colour,
            },
        });
    }

    for (const category of categories) {
        await db.productCategory.create({
            data: {
                productId: product.id,
                globalCategoryId: category,
            },
        });
    }

    if (imageUrls) {
        for (const imageUrl of imageUrls) {
            await db.image.create({
                data: {
                    url: imageUrl,
                    productId: product.id,
                },
            });
        }
    }

    revalidatePath("/");
    revalidatePath("/products");

    if (typeof window !== "undefined") {
        window.location.href = "/admin/products";
    } else {
        redirect("/admin/products");
    }
}

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    images: z.array(fileSchema).optional(),
    existingImageUrls: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return Array.isArray(JSON.parse(val));
        } catch {
            return false;
        }
    }, "Invalid existingImageUrls format"),
});

export async function updateProduct(
    id: string,
    prevState: unknown,
    formData: FormData
) {
    const entries = Object.fromEntries(formData.entries());

    const result = editSchema.safeParse(entries);
    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);
    const categories = JSON.parse(data.categories);
    const imageUrls: string[] = JSON.parse(data.imageUrls);
    const existingImageUrls: string[] = JSON.parse(data.existingImageUrls);
    const product = await db.product.findUnique({ where: { id } });

    if (product == null) return notFound();

    await db.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            priceInPence: data.priceInPence,
            availableQuantity: data.availableQuantity,
            lengthInMm: data.lengthInMm ?? null,
            widthInMm: data.widthInMm ?? null,
            heightInMm: data.heightInMm ?? null,
            filePath: data.file?.name || "",
        },
    });

    await db.productColour.deleteMany({ where: { productId: id } });
    for (const colour of colours) {
        await db.productColour.create({
            data: {
                productId: id,
                globalColourId: colour,
            },
        });
    }

    await db.productCategory.deleteMany({ where: { productId: id } });
    for (const category of categories) {
        await db.productCategory.create({
            data: {
                productId: id,
                globalCategoryId: category,
            },
        });
    }

    if (imageUrls) {
        const newImageUrls = imageUrls.filter(
            (url: string) => !existingImageUrls.includes(url)
        );
        for (const imageUrl of newImageUrls) {
            await db.image.create({
                data: {
                    url: imageUrl,
                    productId: id,
                },
            });
        }
    }

    revalidatePath("/");
    revalidatePath("/products");

    if (typeof window !== "undefined") {
        window.location.href = "/admin/products";
    } else {
        redirect("/admin/products");
    }
}

export async function toggleProductAvailability(
    id: string,
    isAvailableForPurchase: boolean
) {
    await db.product.update({
        where: { id },
        data: { isAvailableForPurchase },
    });

    revalidatePath("/");
    revalidatePath("/products");
}

export async function deleteProduct(id: string) {
    const product = await db.product.findUnique({
        where: { id },
        include: { images: true },
    });

    if (product == null) return notFound();

    await db.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/products");

    redirect("/admin/products");
}
