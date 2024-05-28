// route.tsx

import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
    try {
        const sig = req.headers.get("stripe-signature");
        const event = stripe.webhooks.constructEvent(
            await req.text(),
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );

        switch (event.type) {
            case "charge.succeeded": {
                const charge = event.data.object as Stripe.Charge;
                const productId = charge.metadata.productId;
                const email = charge.billing_details.email;
                const pricePaidInPence = charge.amount;
                const quantity = parseInt(charge.metadata.quantity, 10);
                const colour = charge.metadata.colour;

                console.log(`Charge succeeded: ${JSON.stringify(charge)}`);

                const product = await db.product.findUnique({
                    where: { id: productId },
                });

                if (!product || !email) {
                    console.error(
                        `Product not found or invalid email: ${productId}, ${email}`
                    );
                    return new NextResponse("Bad Request", { status: 400 });
                }

                await db.product.update({
                    where: { id: productId },
                    data: {
                        availableQuantity: product.availableQuantity - quantity,
                    },
                });

                console.log(`Updated product quantity for ${productId}`);

                const user = await db.user.upsert({
                    where: { email },
                    create: {
                        email,
                        orders: {
                            create: {
                                items: {
                                    create: {
                                        productId,
                                        priceInPence: pricePaidInPence,
                                        quantity,
                                        colour,
                                    },
                                },
                            },
                        },
                    },
                    update: {
                        orders: {
                            create: {
                                items: {
                                    create: {
                                        productId,
                                        priceInPence: pricePaidInPence,
                                        quantity,
                                        colour,
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        orders: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            include: { items: true },
                        },
                    },
                });

                const order = user.orders[0];
                console.log(`Created order: ${JSON.stringify(order)}`);

                // Optionally, send a confirmation email
                // await resend.emails.send({
                //     from: `Support <${process.env.SENDER_EMAIL}>`,
                //     to: email,
                //     subject: "Order Confirmation",
                //     react: (
                //         <PurchaseReceiptEmail
                //             order={order}
                //             product={product}
                //             downloadVerificationId={""} // Adjust this if you have download verification
                //         />
                //     ),
                // });

                return new NextResponse();
            }
            case "payment_intent.created":
                console.log(`Payment intent created: ${JSON.stringify(event)}`);
                return new NextResponse();
            default:
                console.log(`Unhandled event type: ${event.type}`);
                return new NextResponse(`Unhandled event type: ${event.type}`, {
                    status: 200,
                });
        }
    } catch (err) {
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}
