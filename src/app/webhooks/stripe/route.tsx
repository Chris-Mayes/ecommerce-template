import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/db/db";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
    try {
        const sig = req.headers.get("stripe-signature");
        const text = await req.text();
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                text,
                sig as string,
                process.env.STRIPE_WEBHOOK_SECRET as string
            );
        } catch (err) {
            console.error(`⚠️  Webhook signature verification failed.`, err);
            return new NextResponse("Webhook signature verification failed", {
                status: 400,
            });
        }

        switch (event.type) {
            case "charge.succeeded": {
                const charge = event.data.object as Stripe.Charge;
                const productId = charge.metadata.productId;
                const email = charge.billing_details.email;
                const pricePaidInPence = charge.amount;
                const quantity = parseInt(charge.metadata.quantity, 10);
                const colour = charge.metadata.colour;
                const shippingAddress = charge.shipping?.address;

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
                                shippingAddress: {
                                    create: {
                                        line1: shippingAddress?.line1 || "",
                                        city: shippingAddress?.city || "",
                                        postalCode:
                                            shippingAddress?.postal_code || "",
                                        country: shippingAddress?.country || "",
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
                                shippingAddress: {
                                    create: {
                                        line1: shippingAddress?.line1 || "",
                                        city: shippingAddress?.city || "",
                                        postalCode:
                                            shippingAddress?.postal_code || "",
                                        country: shippingAddress?.country || "",
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        orders: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            include: { items: true, shippingAddress: true },
                        },
                    },
                });

                const order = user.orders[0];
                const totalPriceInPence = order.items.reduce(
                    (sum, item) => sum + item.priceInPence,
                    0
                );

                console.log(`Created order: ${JSON.stringify(order)}`);

                await resend.emails.send({
                    from: `Support <${process.env.SENDER_EMAIL}>`,
                    to: email,
                    subject: "Order Confirmation",
                    react: (
                        <PurchaseReceiptEmail
                            order={{
                                ...order,
                                pricePaidInPence: totalPriceInPence,
                            }}
                            product={product}
                            downloadVerificationId={""}
                        />
                    ),
                });

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
        console.error("Error handling Stripe webhook:", err);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
