import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import db from "@/db/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { cart } = req.body;

        type CartItem = {
            productId: string;
            quantity: number;
            colour: string;
            productPrice: number;
        };

        const amount = (cart as CartItem[]).reduce(
            (total: number, item: CartItem) =>
                total + item.productPrice * item.quantity,
            0
        );

        try {
            const cartDetails = await db.cart.create({
                data: {
                    items: {
                        create: cart.map((item: CartItem) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            colour: item.colour,
                            price: item.productPrice,
                        })),
                    },
                    totalAmount: amount,
                },
            });

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "GBP",
                metadata: { cartId: cartDetails.id },
            });

            console.log("Payment intent created:", paymentIntent);
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
