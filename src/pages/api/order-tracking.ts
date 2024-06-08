import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { orderId, email } = req.body;

    const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order || order.user.email !== email) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
}
