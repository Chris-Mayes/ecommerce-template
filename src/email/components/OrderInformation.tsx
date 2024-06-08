import {
    Button,
    Column,
    Img,
    Row,
    Section,
    Text,
} from "@react-email/components";

type OrderInformationProps = {
    product: { imagePath: string; name: string; description: string };
    quantity: number;
    colour: string;
    downloadVerificationId: string;
};

const enableDownload = false;

export function OrderInformation({
    product,
    quantity,
    colour,
    downloadVerificationId,
}: OrderInformationProps) {
    return (
        <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
            <Img
                width="100%"
                alt={product.name}
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}${product.imagePath}`}
            />
            <Row className="mt-8">
                <Column className="align-bottom">
                    <Text className="text-lg font-bold m-0 mr-4">
                        {product.name}
                    </Text>
                    <Text className="text-gray-500 mb-0">
                        Quantity: {quantity}
                    </Text>
                    <Text className="text-gray-500 mb-0">Colour: {colour}</Text>
                </Column>
                {enableDownload ? (
                    <Column align="right">
                        <Button
                            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/products/download/${downloadVerificationId}`}
                            className="bg-black text-white px-6 py-4 rounded text-lg"
                        >
                            Download
                        </Button>
                    </Column>
                ) : null}
            </Row>
            <Row>
                <Column>
                    <Text className="text-gray-500 mb-0">
                        {product.description}
                    </Text>
                </Column>
            </Row>
        </Section>
    );
}
