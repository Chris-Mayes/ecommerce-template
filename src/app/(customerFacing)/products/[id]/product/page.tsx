import db from "@/db/db";
import { notFound } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";

export default async function ProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({ where: { id } });
    if (product == null) return notFound();

    return (
        <div className="p-4 max-w-5xl pt-20 mx-auto">
            <div className="flex w-full mb-4">
                <div className="relative w-1/2 h-112">
                    <Image
                        src={product.imagePath}
                        layout="fill"
                        objectFit="contain"
                        alt={product.name}
                    />
                </div>

                <div className="flex flex-col w-1/2 pl-12 pt-2 justify-between">
                    <div className="flex mb-4">
                        <h1 className="text-2xl font-bold text-left">
                            {product.name}
                        </h1>
                    </div>
                    <div className="flex-grow flex flex-col justify-top">
                        <p className="mb-2">{product.description}</p>
                    </div>
                    <div className="mt-auto pb-4">
                        <p className="text-lg font-semibold mb-4">
                            Add size info
                        </p>
                        <p className="text-lg font-semibold mb-4">
                            {formatCurrency(product.priceInPence / 100)}
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="w-auto max-w-xs self-start --primary-buttons"
                        >
                            <Link href={`/products/${id}/purchase`}>
                                Purchase
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
