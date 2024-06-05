import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Suspense } from "react";

const getProductsByCategories = cache(async () => {
    const products = await db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { name: "asc" },
        include: {
            images: true,
            categories: {
                include: {
                    globalCategory: true,
                },
            },
        },
    });

    const productsByCategory = products.reduce((acc, product) => {
        const category =
            product.categories[0]?.globalCategory?.name || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, typeof products>);

    return productsByCategory;
}, ["/products", "getProductsByCategories"]);

export default function ProductsPage() {
    return (
        <div className="space-y-8">
            <Suspense
                fallback={
                    <>
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                    </>
                }
            >
                <ProductsSuspense />
            </Suspense>
        </div>
    );
}

async function ProductsSuspense() {
    const productsByCategory = await getProductsByCategories();

    return Object.entries(productsByCategory).map(([category, products]) => (
        <div key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        priceInPence={product.priceInPence}
                        description={product.description}
                        images={product.images}
                    />
                ))}
            </div>
        </div>
    ));
}
