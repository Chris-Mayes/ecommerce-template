"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";

export default function BasketCount() {
    const { cart } = useCart();
    const [itemCount, setItemCount] = useState(0);

    useEffect(() => {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setItemCount(count);
    }, [cart]);

    return (
        <div className="flex items-center pt-4">
            <Link href="/cart" className="text-black flex items-center mr-2">
                <FontAwesomeIcon
                    icon={faShoppingBasket}
                    className="mr-2 custom-icon-size"
                />
                Basket
            </Link>
            {itemCount > 0 && (
                <div className="bg-primary-secondaryColour text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    {itemCount}
                </div>
            )}
        </div>
    );
}
