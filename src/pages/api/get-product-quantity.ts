import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { productId } = req.query;

    if (!productId || typeof productId !== "string") {
        return res.status(400).json({ error: "Invalid productId" });
    }

    try {
        const product = await db.product.findUnique({
            where: { id: productId },
            select: { availableQuantity: true },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ availableQuantity: product.availableQuantity });
    } catch (error) {
        console.error("Error fetching product quantity:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
