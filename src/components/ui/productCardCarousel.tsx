"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type CarouselProps = {
    images: { url: string }[];
};

const getFullImageUrl = (relativeUrl: string) => {
    return `https://climbing-shop-851c1ee23d02.herokuapp.com${relativeUrl}`;
};

const Carousel = ({ images }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    console.log(
        "Images:",
        images.map((img) => getFullImageUrl(img.url))
    );
    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full h-full">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <Image
                        src={getFullImageUrl(image.url)}
                        fill
                        style={{ objectFit: "cover" }}
                        alt={`Slide ${index + 1}`}
                    />
                </div>
            ))}
        </div>
    );
};

export default Carousel;
