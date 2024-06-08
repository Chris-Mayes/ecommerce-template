"use client";
import { useState } from "react";
import Image from "next/image";

type ProductPageCarouselProps = {
    images: { url: string }[];
    mainImageAlt: string;
};

const ProductPageCarousel = ({
    images,
    mainImageAlt,
}: ProductPageCarouselProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    return (
        <div className="flex">
            <div className="flex flex-col space-y-2 items-center justify-center">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`cursor-pointer p-1 border ${
                            index === selectedImageIndex
                                ? "border-blue-500"
                                : "border-transparent"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                    >
                        <Image
                            src={image.url}
                            width={60}
                            height={60}
                            objectFit="cover"
                            alt={`Thumbnail ${index + 1}`}
                        />
                    </div>
                ))}
            </div>
            <div className="relative w-full lg:w-[500px] lg:h-[500px] ml-4">
                {images.length > 0 ? (
                    <Image
                        src={images[selectedImageIndex].url}
                        fill
                        style={{ objectFit: "contain" }}
                        alt={mainImageAlt}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span>No image available</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPageCarousel;
