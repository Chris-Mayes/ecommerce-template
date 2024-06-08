"use server";

import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailOrderHistory(
    prevState: unknown,
    formData: FormData
): Promise<{ message?: string; error?: string }> {
    const result = emailSchema.safeParse(formData.get("email"));

    if (result.success === false) {
        return { error: "Invalid email address" };
    }

    const user = await db.user.findUnique({
        where: { email: result.data },
        select: {
            email: true,
            orders: {
                select: {
                    id: true,
                    createdAt: true,
                    items: {
                        select: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: { select: { url: true } },
                                    description: true,
                                },
                            },
                            priceInPence: true,
                            quantity: true,
                            colour: true,
                        },
                    },
                },
            },
        },
    });

    if (user == null) {
        return {
            message:
                "Check your email to view your order history and download your products.",
        };
    }

    const orders = await Promise.all(
        user.orders.flatMap((order) =>
            order.items.map(async (item) => ({
                id: order.id,
                createdAt: order.createdAt,
                pricePaidInPence: item.priceInPence,
                downloadVerificationId: (
                    await db.downloadVerification.create({
                        data: {
                            expiresAt: new Date(
                                Date.now() + 24 * 1000 * 60 * 60
                            ),
                            productId: item.product.id,
                        },
                    })
                ).id,
                quantity: item.quantity,
                colour: item.colour ?? "No Colour Specified",
                product: {
                    name: item.product.name,
                    description: item.product.description,
                    imagePath:
                        item.product.images[0]?.url ??
                        "/default-image-path.jpg",
                },
            }))
        )
    );

    const data = await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: "Order History",
        react: <OrderHistoryEmail orders={orders} />,
    });

    if (data.error) {
        return {
            error: "There was an error sending your email. Please try again.",
        };
    }

    return {
        message:
            "Check your email to view your order history and download your products.",
    };
}
