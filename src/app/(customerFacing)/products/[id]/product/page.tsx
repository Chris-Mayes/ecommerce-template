import db from "@/db/db";
import { notFound } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";

export default async function ProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({
        where: { id },
        include: { colours: true }, // Include colours in the query
    });
    if (product == null) return notFound();

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
                    </div>

                    <div className="mt-auto pb-4">
                        <div className="mb-4">
                            <Label htmlFor="colour">Colour</Label>
                            <select
                                id="colour"
                                name="colour"
                                className="block w-full mt-1"
                            >
                                {product.colours.map((colour) => (
                                    <option key={colour.id} value={colour.name}>
                                        {colour.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
