import db from "@/db/db";
import { notFound } from "next/navigation";
import ProductImageCarousel from "@/components/ui/productPageCarousel";
import ProductPurchaseForm from "../../../../../components/ProductPurchasePage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default async function ProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({
        where: { id },
        include: {
            colours: {
                include: {
                    globalColour: true,
                },
            },
            images: true,
        },
    });

    if (!product) return notFound();

    const serializableProduct = {
        ...product,
        colours: product.colours.map((productColour) => ({
            id: productColour.globalColour.id,
            name: productColour.globalColour.name,
        })),
        images: product.images.map((image) => ({
            url: image.url,
        })),
    };

    const hasDimensions =
        (product.lengthInMm ?? 0) > 0 ||
        (product.widthInMm ?? 0) > 0 ||
        (product.heightInMm ?? 0) > 0;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-12">
                <Link href="/products" className="flex items-center text-black">
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        className="mr-2 w-6 h-6"
                    />
                    <span className="align-middle">Back to Products</span>
                </Link>
            </div>
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
                        {hasDimensions && (
                            <div className="mt-4">
                                <p className="font-semibold">
                                    Approximate Dimensions (mm):
                                </p>
                                {(product.lengthInMm ?? 0) > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">
                                            Length:
                                        </span>
                                        <span>{product.lengthInMm}</span>
                                    </div>
                                )}
                                {(product.widthInMm ?? 0) > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">
                                            Width:
                                        </span>
                                        <span>{product.widthInMm}</span>
                                    </div>
                                )}
                                {(product.heightInMm ?? 0) > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">
                                            Height:
                                        </span>
                                        <span>{product.heightInMm}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-9">
                        <p className="pb-2">
                            Available Quantity: {product.availableQuantity}
                        </p>
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
