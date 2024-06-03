import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Tailwind,
} from "@react-email/components";
import { OrderInformation } from "./components/OrderInformation";
import React from "react";

type OrderHistoryEmailProps = {
    orders: {
        id: string;
        pricePaidInPence: number;
        createdAt: Date;
        downloadVerificationId: string;
        quantity: number;
        colour: string;
        product: {
            name: string;
            imagePath: string;
            description: string;
        };
    }[];
};

OrderHistoryEmail.PreviewProps = {
    orders: [
        {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            pricePaidInPence: 10000,
            downloadVerificationId: crypto.randomUUID(),
            quantity: 1,
            colour: "Red",
            product: {
                name: "Product name",
                description: "Some description",
                imagePath: "/products/1",
            },
        },
        {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            pricePaidInPence: 2000,
            downloadVerificationId: crypto.randomUUID(),
            quantity: 2,
            colour: "Blue",
            product: {
                name: "Product name 2",
                description: "Some other desc",
                imagePath: "/products/2",
            },
        },
    ],
} satisfies OrderHistoryEmailProps;

export default function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
    return (
        <Html>
            <Preview>Order History & Downloads</Preview>
            <Tailwind>
                <Head />
                <Body className="font-sans bg-white">
                    <Container className="max-w-xl">
                        <Heading>Order History</Heading>
                        {orders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <OrderInformation
                                    order={order}
                                    product={order.product}
                                    downloadVerificationId={
                                        order.downloadVerificationId
                                    }
                                    quantity={order.quantity}
                                    colour={order.colour}
                                />
                                {index < orders.length - 1 && <Hr />}
                            </React.Fragment>
                        ))}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
