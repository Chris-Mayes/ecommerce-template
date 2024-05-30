import db from "@/db/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductPurchaseForm from "../../../../../components/ProductPurchasePage";
import { formatCurrency } from "@/lib/formatters";

export default async function ProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({
        where: { id },
        include: { colours: true },
    });

    if (!product) return notFound();

    const serializableProduct = {
        ...product,
        colours: product.colours.map((colour) => ({
            id: colour.id,
            name: colour.name,
        })),
    };

    return (
        <div className="p-4 max-w-5xl pt-20 mx-auto">
            <div className="flex flex-col lg:flex-row w-full">
                <div className="relative w-full lg:w-1/2 h-112 mb-4 lg:mb-0">
                    <Image
                        src={product.imagePath}
                        layout="fill"
                        objectFit="contain"
                        alt={product.name}
                    />
                </div>

                <div className="flex flex-col w-full lg:w-1/2 pl-0 lg:pl-12 negative-mt-2 justify-between">
                    <div className="flex mb-4">
                        <h1 className="text-2xl font-bold text-left">
                            {product.name}
                        </h1>
                    </div>
                    <p className="text-lg font-semibold mb-4">
                        {`£${(product.priceInPence / 100).toFixed(2)}`}
                    </p>
                    <div className="flex-grow flex flex-col justify-top">
                        <p className="mb-2 pb-3">{product.description}</p>
                        <div className="mt-4">
                            <p className="font-semibold">
                                Approximate Dimensions (mm):
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Length:</span>
                                <span>{product.lengthInMm}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Width:</span>
                                <span>{product.widthInMm}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Height:</span>
                                <span>{product.heightInMm}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <p>Available Quantity: {product.availableQuantity}</p>
                        <ProductPurchaseForm
                            productId={id}
                            productPrice={product.priceInPence}
                            colours={serializableProduct.colours}
                            availableQuantity={product.availableQuantity}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
