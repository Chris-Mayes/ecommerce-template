"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type CarouselProps = {
    images: { url: string }[];
};

const Carousel = ({ images }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    if (!images || images.length === 0) return null;
    console.log("Images:", images);
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
                        src={image.url}
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
