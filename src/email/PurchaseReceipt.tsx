import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Tailwind,
} from "@react-email/components";
import { OrderInformation } from "./components/OrderInformation";

type PurchaseReceiptEmailProps = {
    products: {
        imagePath: string;
        name: string;
        description: string;
        quantity: number;
        colour: string;
    }[];
    order: { id: string; createdAt: Date; pricePaidInPence: number };
    downloadVerificationId: string;
};

PurchaseReceiptEmail.PreviewProps = {
    products: [
        {
            name: "Product name",
            description: "Some description",
            imagePath:
                "/products/5aba7442-e4a5-4d2e-bfa7-5bd358cdad64-02 - What Is Next.js.jpg",
            quantity: 1,
            colour: "Red",
        },
    ],
    order: {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInPence: 10000,
    },
    downloadVerificationId: crypto.randomUUID(),
} satisfies PurchaseReceiptEmailProps;

export default function PurchaseReceiptEmail({
    products,
    order,
    downloadVerificationId,
}: PurchaseReceiptEmailProps) {
    return (
        <Html>
            <Preview>Download your products and view receipt</Preview>
            <Tailwind>
                <Head />
                <Body className="font-sans bg-white">
                    <Container className="max-w-xl">
                        <Heading>Purchase Receipt</Heading>
                        {products.map((product, index) => (
                            <OrderInformation
                                key={index}
                                order={order}
                                product={product}
                                quantity={product.quantity}
                                colour={product.colour}
                                downloadVerificationId={downloadVerificationId}
                            />
                        ))}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
