import db from "@/db/db";
import { notFound } from "next/navigation";
import ProductImageCarousel from "@/components/ui/productPageCarousel";
import ProductPurchaseForm from "../../../../../components/ProductPurchasePage";
import { formatCurrency } from "@/lib/formatters";

export default async function ProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({
        where: { id },
        include: { colours: true, images: true },
    });

    if (!product) return notFound();

    const serializableProduct = {
        ...product,
        colours: product.colours.map((colour) => ({
            id: colour.id,
            name: colour.name,
        })),
        images: product.images.map((image) => ({
            url: image.url,
        })),
    };

    return (
        <div className="p-0 max-w-5xl pt-20 mx-auto">
            <div className="flex flex-col lg:flex-row w-full">
                <div className="relative w-full lg:w-1/2 mb-4 lg:mb-0">
                    <ProductImageCarousel
                        images={serializableProduct.images}
                        mainImageAlt={product.name}
                    />
                </div>

                <div className="flex flex-col w-full lg:w-1/2 pl-0 lg:pl-12 lg:ml-6 negative-mt-6 justify-between pt-6">
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

                    <div className="mt-auto pt-9">
                        <p>Available Quantity: {product.availableQuantity}</p>
                        <ProductPurchaseForm
                            productId={id}
                            productPrice={product.priceInPence}
                            colours={serializableProduct.colours}
                            availableQuantity={product.availableQuantity}
                            imagePath={
                                product.images[0]?.url ??
                                "/default-image-path.jpg"
                            }
                            name={product.name}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
