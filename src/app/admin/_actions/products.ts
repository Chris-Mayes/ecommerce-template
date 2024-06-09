"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
    (file) => file.size > 0 && file.type.startsWith("image/"),
    { message: "Invalid image file" }
);

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInPence: z.coerce.number().int().min(1),
    availableQuantity: z.coerce.number().int().min(0),
    lengthInMm: z.coerce.number().int().optional().nullable(),
    widthInMm: z.coerce.number().int().optional().nullable(),
    heightInMm: z.coerce.number().int().optional().nullable(),
    file: fileSchema.refine((file) => file.size > 0, "Required"),
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
});

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function addProduct(prevState: unknown, formData: FormData) {
    const entries = Object.fromEntries(formData.entries());

    const images = formData
        .getAll("images")
        .filter((file) => file instanceof File) as File[];

    const result = addSchema.safeParse(entries);
    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    for (const image of images) {
        const imageResult = imageSchema.safeParse(image);
        if (!imageResult.success) {
            return {
                images: imageResult.error.errors.map((err) => err.message),
            };
        }
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);
    const categories = JSON.parse(data.categories);

    console.log(`BASE_URL: ${BASE_URL}`);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${BASE_URL}/api/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Error uploading file to S3");
        }

        const { url } = await res.json();
        return url;
    };

    const imageUrls = await Promise.all(images.map(uploadFile));

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
            filePath: await uploadFile(data.file),
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

    for (const imageUrl of imageUrls) {
        await db.image.create({
            data: {
                url: imageUrl,
                productId: product.id,
            },
        });
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
    images: z.array(imageSchema).optional(),
});

export async function updateProduct(
    id: string,
    prevState: unknown,
    formData: FormData
) {
    const entries = Object.fromEntries(formData.entries());

    const images = formData
        .getAll("images")
        .filter((file) => file instanceof File) as File[];

    const result = editSchema.safeParse(entries);
    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    for (const image of images) {
        const imageResult = imageSchema.safeParse(image);
        if (!imageResult.success) {
            return {
                images: imageResult.error.errors.map((err) => err.message),
            };
        }
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);
    const categories = JSON.parse(data.categories);
    const product = await db.product.findUnique({ where: { id } });

    if (product == null) return notFound();

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${BASE_URL}/api/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Error uploading file to S3");
        }

        const { url } = await res.json();
        return url;
    };

    let filePath = product.filePath;
    if (data.file != null && data.file.size > 0) {
        filePath = await uploadFile(data.file);
    }

    const imageUrls = [];
    if (images.length > 0) {
        await db.image.deleteMany({ where: { productId: id } });

        for (const image of images) {
            const imageUrl = await uploadFile(image);
            imageUrls.push(imageUrl);
        }
    }

    await db.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            priceInPence: data.priceInPence,
            availableQuantity: data.availableQuantity,
            filePath,
            lengthInMm: data.lengthInMm ?? null,
            widthInMm: data.widthInMm ?? null,
            heightInMm: data.heightInMm ?? null,
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

    for (const imageUrl of imageUrls) {
        await db.image.create({
            data: {
                url: imageUrl,
                productId: id,
            },
        });
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
