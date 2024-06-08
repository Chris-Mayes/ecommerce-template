import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (req.method === "DELETE") {
        try {
            await db.order.delete({
                where: { id: id as string },
            });
            res.status(204).end();
        } catch (error) {
            console.error("Error deleting order:", error);
            res.status(500).json({ error: "Failed to delete order" });
        }
    } else if (req.method === "PUT") {
        const { status } = req.body;
        try {
            await db.order.update({
                where: { id: id as string },
                data: { status },
            });
            res.status(200).json({
                message: "Order status updated successfully",
            });
        } catch (error) {
            console.error("Error updating order status:", error);
            res.status(500).json({ error: "Failed to update order status" });
        }
    } else {
        res.setHeader("Allow", ["DELETE", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
