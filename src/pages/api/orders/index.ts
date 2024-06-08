import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const orders = await db.order.findMany({
                select: {
                    id: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                    customerName: true,
                    items: {
                        select: {
                            id: true,
                            product: { select: { name: true } },
                            quantity: true,
                            priceInPence: true,
                            colour: true,
                        },
                    },
                    shippingAddress: {
                        select: {
                            line1: true,
                            city: true,
                            postalCode: true,
                            country: true,
                        },
                    },
                    status: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            });

            res.status(200).json(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ error: "Failed to fetch orders" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
