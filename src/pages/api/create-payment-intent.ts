import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import db from "@/db/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { cart, userId, sessionId } = req.body;

        const amount = cart.reduce(
            (total: number, item: any) =>
                total + item.productPrice * item.quantity,
            0
        );

        try {
            const cartDetails = await db.activeCart.upsert({
                where: {
                    userId_sessionId: {
                        userId: userId ?? "",
                        sessionId: sessionId ?? "",
                    },
                },
                update: {
                    items: {
                        create: cart.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            colour: item.colour,
                            price: item.productPrice,
                        })),
                    },
                    totalAmount: amount,
                },
                create: {
                    userId: userId ?? "",
                    sessionId: sessionId ?? "",
                    totalAmount: amount,
                    items: {
                        create: cart.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            colour: item.colour,
                            price: item.productPrice,
                        })),
                    },
                },
            });

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "GBP",
                metadata: { cartId: cartDetails.id },
            });

            res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            console.error("Error creating payment intent:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
