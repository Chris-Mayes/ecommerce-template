// app/products/[id]/page.tsx

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
            <div className="flex flex-col lg:flex-row w-full mb-4">
                <div className="relative w-full lg:w-1/2 h-112 mb-4 lg:mb-0">
                    <Image
                        src={product.imagePath}
                        layout="fill"
                        objectFit="contain"
                        alt={product.name}
                    />
                </div>

                <div className="flex flex-col w-full lg:w-1/2 pl-0 lg:pl-12 pt-2 justify-between">
                    <div className="flex mb-4">
                        <h1 className="text-2xl font-bold text-left">
                            {product.name}
                        </h1>
                    </div>
                    <div className="flex-grow flex flex-col justify-top">
                        <p className="mb-2 pb-3">{product.description}</p>
                        <p>Approximate Dimensions(mm):</p>
                        <p>&#x2022; Length: {product.lengthInMm}</p>
                        <p>&#x2022; Width: {product.widthInMm}</p>
                        <p>&#x2022; Height: {product.heightInMm}</p>
                        <p>Available Quantity: {product.availableQuantity}</p>
                    </div>

                    <div className="mt-auto pb-4">
                        <p className="text-lg font-semibold mb-4">
                            {formatCurrency(product.priceInPence / 100)}
                        </p>
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
