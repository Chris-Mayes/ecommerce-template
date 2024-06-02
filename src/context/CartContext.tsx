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
    updateCartItemQuantity: (
        productId: string,
        colour: string,
        quantity: number
    ) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.colour === item.colour
            );
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.colour === item.colour
                        ? {
                              ...cartItem,
                              quantity: cartItem.quantity + item.quantity,
                          }
                        : cartItem
                );
            } else {
                return [...prevCart, item];
            }
        });
    };

    const removeFromCart = (productId: string, colour: string) => {
        setCart((prevCart) =>
            prevCart.filter(
                (item) =>
                    !(item.productId === productId && item.colour === colour)
            )
        );
    };

    const updateCartItemQuantity = (
        productId: string,
        colour: string,
        quantity: number
    ) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.productId === productId && item.colour === colour
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateCartItemQuantity,
                clearCart,
            }}
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
