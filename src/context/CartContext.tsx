"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

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
    getTotalQuantityForProduct: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            const storedCart = localStorage.getItem("cart");
            return storedCart ? JSON.parse(storedCart) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

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
        localStorage.removeItem("cart");
    };

    const getTotalQuantityForProduct = (productId: string) => {
        return cart
            .filter((item) => item.productId === productId)
            .reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateCartItemQuantity,
                clearCart,
                getTotalQuantityForProduct,
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
