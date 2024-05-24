import db from "@/db/db";
import { notFound } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import { create } from "domain";


async function createprod(colour:string,quantity:any,product:any)
{
    let val = ""
    const configproduct = await db.configuredProduct.create({
        data: {
            productId: product.id,
            purchasequantity:quantity,
            Colour:colour
        },
    }).then(
        function(result)
        {
            val=`/products/${result.id}/purchase`
        }
    )
    return  val
}

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

                        <Input
                    type="number"
                    id="purchasequantity"
                    name="purchasequantity"
                    required
                    defaultValue={1}
                    min={1}
                    max={product.availablequantity}
                        /> 

                        <p className="text-lg font-semibold mb-4">
                            {product.availablequantity} Available
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="w-auto max-w-xs self-start --primary-buttons"
                        >
                            
                            <Link href={await createprod("Blue",1,product)} >
                                Purchase
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        
    );
}

