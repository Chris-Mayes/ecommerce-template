import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Tailwind,
    Text,
    Section,
} from "@react-email/components";
import { OrderInformation } from "./components/OrderInformation";

type PurchaseReceiptEmailProps = {
    products: {
        imagePath: string;
        name: string;
        description: string;
        quantity: number;
        colour: string;
        price: number;
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
            price: 1000,
        },
    ],
    order: {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInPence: 1000,
    },
    downloadVerificationId: crypto.randomUUID(),
} satisfies PurchaseReceiptEmailProps;

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function PurchaseReceiptEmail({
    products,
    order,
    downloadVerificationId,
}: PurchaseReceiptEmailProps) {
    const totalPriceInPence = products.reduce(
        (sum, product) => sum + (product.price * product.quantity || 0),
        0
    );

    return (
        <Html>
            <Preview>View receipt</Preview>
            <Tailwind>
                <Head />
                <Body className="font-sans bg-white">
                    <Container className="max-w-xl">
                        <Heading>Purchase Receipt</Heading>
                        <Section>
                            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                                Order ID: {order.id}
                            </Text>
                            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                                Purchased On:{" "}
                                {dateFormatter.format(order.createdAt)}
                            </Text>
                            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                                Price Paid: £
                                {(totalPriceInPence / 100).toFixed(2)}
                            </Text>
                        </Section>
                        {products.map((product, index) => (
                            <OrderInformation
                                key={index}
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
