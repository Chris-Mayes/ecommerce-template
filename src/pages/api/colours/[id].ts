import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (req.method === "DELETE") {
        try {
            const colour = await db.globalColour.findUnique({
                where: { id: id as string },
            });

            if (!colour) {
                console.error(`Colour not found with id: ${id}`);
                return res.status(404).json({ error: "Colour not found" });
            }

            await db.globalColour.delete({
                where: { id: id as string },
            });

            res.status(204).end();
        } catch (error) {
            console.error(`Error deleting colour with id: ${id}`, error);
            res.status(500).json({ error: "Failed to delete colour" });
        }
    } else {
        res.setHeader("Allow", ["DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
