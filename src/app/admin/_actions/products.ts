"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
    (file) => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInPence: z.coerce.number().int().min(1),
    lengthInMm: z.coerce.number().int().min(1),
    widthInMm: z.coerce.number().int().min(1),
    heightInMm: z.coerce.number().int().min(1),
    availablequantity: z.coerce.number().int().min(1),
    file: fileSchema.refine((file) => file.size > 0, "Required"),
    image: imageSchema.refine((file) => file.size > 0, "Required"),
    colours: z.string().refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, "Invalid colours format"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);

    await fs.mkdir("products", { recursive: true });
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/products", { recursive: true });
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
        `public${imagePath}`,
        Buffer.from(await data.image.arrayBuffer())
    );

    const product = await db.product.create({
        data: {
            isAvailableForPurchase: false,
            name: data.name,
            description: data.description,
            priceInPence: data.priceInPence,
            lengthInMm: data.lengthInMm,
            widthInMm: data.widthInMm,
            heightInMm: data.heightInMm,
            availablequantity: data.availablequantity,
            filePath,
            imagePath,
        },
    });

    for (const colour of colours) {
        await db.colour.create({
            data: {
                name: colour,
                productId: product.id,
            },
        });
    }

    revalidatePath("/");
    revalidatePath("/products");

    redirect("/admin/products");
}

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    image: imageSchema.optional(),
});

export async function updateProduct(
    id: string,
    prevState: unknown,
    formData: FormData
) {
    const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    const colours = JSON.parse(data.colours);
    const product = await db.product.findUnique({ where: { id } });

    if (product == null) return notFound();

    let filePath = product.filePath;
    if (data.file != null && data.file.size > 0) {
        await fs.unlink(product.filePath);
        filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
        await fs.writeFile(
            filePath,
            Buffer.from(await data.file.arrayBuffer())
        );
    }

    let imagePath = product.imagePath;
    if (data.image != null && data.image.size > 0) {
        await fs.unlink(`public${product.imagePath}`);
        imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
        await fs.writeFile(
            `public${imagePath}`,
            Buffer.from(await data.image.arrayBuffer())
        );
    }

    await db.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            priceInPence: data.priceInPence,
            availablequantity: data.availablequantity,
            filePath,
            imagePath,
            lengthInMm: data.lengthInMm,
            widthInMm: data.widthInMm,
            heightInMm: data.heightInMm,
        },
    });

    await db.colour.deleteMany({ where: { productId: id } });
    for (const colour of colours) {
        await db.colour.create({
            data: {
                name: colour,
                productId: id,
            },
        });
    }

    revalidatePath("/");
    revalidatePath("/products");

    redirect("/admin/products");
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
    const product = await db.product.delete({ where: { id } });

    if (product == null) return notFound();

    await fs.unlink(product.filePath);
    await fs.unlink(`public${product.imagePath}`);

    revalidatePath("/");
    revalidatePath("/products");
}
