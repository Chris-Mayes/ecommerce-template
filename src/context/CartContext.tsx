"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useLocalStorage } from "usehooks-ts";

interface CartItem {
    productId: string;
    quantity: number;
    colour: string;
    productPrice: number;
    imagePath: string;
    name: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, colour: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => [...prevCart, item]);
    };

    const removeFromCart = (productId: string, colour: string) => {
        setCart((prevCart) =>
            prevCart.filter(
                (item) =>
                    !(item.productId === productId && item.colour === colour)
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
