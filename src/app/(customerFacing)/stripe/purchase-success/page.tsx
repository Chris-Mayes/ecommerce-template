import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: { payment_intent: string };
}) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
        searchParams.payment_intent
    );
    if (paymentIntent.metadata.productId == null) return notFound();

    const product = await db.product.findUnique({
        where: { id: paymentIntent.metadata.productId },
    });
    if (product == null) return notFound();

    const isSuccess = paymentIntent.status === "succeeded";

    const enableDownload = false;

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <h1 className="text-4xl font-bold">
                {isSuccess ? "Success!" : "Error!"}
            </h1>
            <div className="flex gap-4 items-center">
                <div className="relative w-1/4 h-64">
                    <Image
                        src={product.imagePath}
                        fill
                        alt={product.name}
                        className="object-cover"
                    />
                </div>
                <div>
                    <div className="text-lg">
                        {`£${(product.priceInPence / 100).toFixed(2)}`}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                    {isSuccess && enableDownload ? (
                        <Button className="mt-4" size="lg" asChild>
                            <a
                                href={`/products/download/${await createDownloadVerification(
                                    product.id
                                )}`}
                            >
                                Download
                            </a>
                        </Button>
                    ) : !isSuccess ? (
                        <Button className="mt-4" size="lg" asChild>
                            <Link href={`/products/${product.id}/product`}>
                                Try Again
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

async function createDownloadVerification(productId: string) {
    return (
        await db.downloadVerification.create({
            data: {
                productId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        })
    ).id;
}
