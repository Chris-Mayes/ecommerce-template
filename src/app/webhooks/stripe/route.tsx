import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/db/db";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";
import { config as stripeConfig } from "./config";

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
                const cartId = charge.metadata.cartId;
                const email = charge.billing_details.email;
                const name = charge.billing_details.name ?? "Customer";
                const shippingAddress = charge.shipping?.address;

                // console.log(`Charge succeeded: ${JSON.stringify(charge)}`);

                const cart = await db.cart.findUnique({
                    where: { id: cartId },
                    include: { items: true },
                });

                if (!cart || !email) {
                    console.error(
                        `Cart not found or invalid email: ${cartId}, ${email}`
                    );
                    return new NextResponse("Bad Request", { status: 400 });
                }

                for (const item of cart.items) {
                    await db.product.update({
                        where: { id: item.productId },
                        data: {
                            availableQuantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }

                const user = await db.user.upsert({
                    where: { email },
                    create: { email, name },
                    update: { name },
                });

                const order = await db.order.create({
                    data: {
                        userId: user.id,
                        customerName: name,
                        items: {
                            create: cart.items.map((item) => ({
                                productId: item.productId,
                                priceInPence: item.price,
                                quantity: item.quantity,
                                colour: item.colour,
                            })),
                        },
                        shippingAddress: shippingAddress
                            ? {
                                  create: {
                                      line1: shippingAddress.line1 || "",
                                      city: shippingAddress.city || "",
                                      postalCode:
                                          shippingAddress.postal_code || "",
                                      country: shippingAddress.country || "",
                                  },
                              }
                            : undefined,
                    },
                    include: { items: true, shippingAddress: true },
                });

                const totalPriceInPence = order.items.reduce(
                    (sum: number, item: { priceInPence: number }) =>
                        sum + item.priceInPence,
                    0
                );

                // console.log(`Created order: ${JSON.stringify(order)}`);

                const products = await Promise.all(
                    cart.items.map(async (item) => {
                        const product = await db.product.findUnique({
                            where: { id: item.productId },
                            include: { images: true },
                        });
                        return {
                            ...item,
                            name: product?.name ?? "Unknown Product",
                            description:
                                product?.description ??
                                "No description available",
                            imagePath:
                                product?.images[0]?.url ??
                                "/default-image-path.jpg",
                        };
                    })
                );

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
                            products={products}
                            downloadVerificationId={""}
                        />
                    ),
                });

                return new NextResponse();
            }
            default:
                // console.log(`Unhandled event type: ${event.type}`);
                return new NextResponse(`Unhandled event type: ${event.type}`, {
                    status: 200,
                });
        }
    } catch (err) {
        console.error("Error handling Stripe webhook:", err);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}

export { stripeConfig as config };
