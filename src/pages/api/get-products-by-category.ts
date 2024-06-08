import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const products = await db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { name: "asc" },
        include: {
            images: true,
            categories: {
                include: {
                    globalCategory: true,
                },
            },
        },
    });

    const productsByCategory = products.reduce((acc, product) => {
        const category =
            product.categories[0]?.globalCategory?.name || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, typeof products>);

    res.status(200).json(productsByCategory);
}
