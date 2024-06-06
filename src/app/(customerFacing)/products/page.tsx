"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Suspense, useEffect, useState, useRef } from "react";

// Define types
type Product = {
    id: string;
    name: string;
    priceInPence: number;
    description: string;
    lengthInMm: number;
    widthInMm: number;
    heightInMm: number;
    isAvailableForPurchase: boolean;
    availableQuantity: number;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
    images: { url: string }[];
    categories: { globalCategory: { name: string } }[];
};

export default function ProductsPage() {
    return (
        <div className="space-y-8">
            <Suspense
                fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                }
            >
                <ProductsWithCategoryTree />
            </Suspense>
        </div>
    );
}

function ProductsWithCategoryTree() {
    const [productsByCategory, setProductsByCategory] = useState<
        Record<string, Product[]>
    >({});
    const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/get-products-by-category");
            const data = await response.json();
            console.log("Fetched Data:", data); // Add this line
            setProductsByCategory(data);
        };

        fetchData();
    }, []);

    useEffect(() => {
        Object.keys(productsByCategory).forEach((category) => {
            categoryRefs.current[category] = document.getElementById(category);
        });
    }, [productsByCategory]);

    const scrollToCategory = (category: string) => {
        const element = categoryRefs.current[category];
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="flex">
            <CategoryTree
                categories={Object.keys(productsByCategory)}
                onCategoryClick={scrollToCategory}
            />
            <div className="flex-grow space-y-8 ml-12">
                {Object.entries(productsByCategory).map(
                    ([category, products]) => (
                        <div key={category} id={category}>
                            <h2 className="text-2xl font-bold mb-4">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product: Product) => (
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
                    )
                )}
            </div>
        </div>
    );
}

function CategoryTree({
    categories,
    onCategoryClick,
}: {
    categories: string[];
    onCategoryClick: (category: string) => void;
}) {
    return (
        <div className="w-48 border-r border-gray-400 sticky top-40 max-h-[calc(100vh-12rem)] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
                {categories.map((category) => (
                    <li key={category}>
                        <button
                            className="text-black-500 hover:underline"
                            onClick={() => onCategoryClick(category)}
                        >
                            {category}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
