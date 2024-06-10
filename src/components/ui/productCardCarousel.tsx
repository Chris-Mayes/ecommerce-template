"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type CarouselProps = {
    images: { url: string }[];
};

const Carousel = ({ images }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startCarousel = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);
    };

    const stopCarousel = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setCurrentIndex(0);
    };

    useEffect(() => {
        return () => stopCarousel();
    }, []);

    if (!images || images.length === 0) return null;

    return (
        <div
            className="relative w-full h-full"
            onMouseEnter={startCarousel}
            onMouseLeave={stopCarousel}
        >
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
