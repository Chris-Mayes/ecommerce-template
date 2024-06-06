import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const categories = await db.globalCategory.findMany({
            orderBy: { order: "asc" },
        });
        res.status(200).json(categories);
    } else if (req.method === "POST") {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const maxOrder = await db.globalCategory.aggregate({
            _max: { order: true },
        });

        const newCategory = await db.globalCategory.create({
            data: { name, order: (maxOrder._max.order ?? 0) + 1 },
        });
        res.status(201).json(newCategory);
    } else if (req.method === "PUT") {
        const { categories } = req.body;
        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({ error: "Invalid categories data" });
        }

        for (const { id, order } of categories) {
            await db.globalCategory.update({
                where: { id },
                data: { order },
            });
        }
        res.status(200).json({ message: "Categories reordered successfully" });
    } else {
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
