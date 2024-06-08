import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (req.method === "DELETE") {
        try {
            const category = await db.globalCategory.findUnique({
                where: { id: id as string },
            });

            if (!category) {
                console.error(`Category not found with id: ${id}`);
                return res.status(404).json({ error: "Category not found" });
            }

            await db.globalCategory.delete({
                where: { id: id as string },
            });

            res.status(204).end();
        } catch (error) {
            console.error(`Error deleting category with id: ${id}`, error);
            res.status(500).json({ error: "Failed to delete category" });
        }
    } else {
        res.setHeader("Allow", ["DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
