import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import Link from "next/link";
import Carousel from "@/components/ui/productCardCarousel";

type ProductCardProps = {
    id: string;
    name: string;
    priceInPence: number;
    description: string;
    images: { url: string }[];
};

export function ProductCard({
    id,
    name,
    priceInPence,
    description,
    images,
}: ProductCardProps) {
    return (
        <Card className="flex overflow-hidden flex-col">
            <Link
                href={`/products/${id}/product`}
                className="relative w-full pb-[100%]"
            >
                <div className="absolute inset-0">
                    <Carousel images={images} />
                </div>
            </Link>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    {`£${(priceInPence / 100).toFixed(2)}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="line-clamp-4">{description}</p>
            </CardContent>
        </Card>
    );
}

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col animate-pulse">
            <div className="relative w-full pb-[100%] bg-gray-300" />
            <CardHeader>
                <CardTitle>
                    <div className="w-3/4 h-6 rounded-full bg-gray-300" />
                </CardTitle>
                <CardDescription>
                    <div className="w-1/2 h-4 rounded-full bg-gray-300" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="w-full h-4 rounded-full bg-gray-300" />
                <div className="w-full h-4 rounded-full bg-gray-300" />
                <div className="w-3/4 h-4 rounded-full bg-gray-300" />
            </CardContent>
        </Card>
    );
}
