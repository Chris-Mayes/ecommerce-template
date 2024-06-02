import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
    id: string;
    name: string;
    priceInPence: number;
    description: string;
    imagePath: string;
};

export function ProductCard({
    id,
    name,
    priceInPence,
    description,
    imagePath,
}: ProductCardProps) {
    return (
        <Card className="flex overflow-hidden flex-col">
            <Link
                href={`/products/${id}/product`}
                className="relative w-full aspect-w-1 aspect-h-1"
            >
                <Image
                    src={imagePath}
                    fill
                    alt={name}
                    className="cursor-pointer"
                />
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
            {/* Remove the CardFooter or repurpose it if needed */}
        </Card>
    );
}

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col animate-pulse">
            <div className="w-full aspect-video bg-gray-300" />
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
            {/* <CardFooter>
                <Button className="w-full" disabled size="lg"></Button>
            </CardFooter> */}
        </Card>
    );
}
