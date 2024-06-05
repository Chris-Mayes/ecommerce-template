import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingBag,
    faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function DropdownCart() {
    const { cart, updateCartItemQuantity, removeFromCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [availableQuantities, setAvailableQuantities] = useState<{
        [productId: string]: number;
    }>({});
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isClient) {
            const fetchAvailableQuantities = async () => {
                const quantities: { [productId: string]: number } = {};

                for (const item of cart) {
                    if (!quantities[item.productId]) {
                        const response = await fetch(
                            `/api/get-product-quantity?productId=${item.productId}`
                        );
                        const data = await response.json();
                        quantities[item.productId] = data.availableQuantity;
                    }
                }

                setAvailableQuantities(quantities);
            };

            fetchAvailableQuantities();
        }
    }, [isClient, cart]);

    const toggleCart = () => setIsOpen((prev) => !prev);

    const getTotalPrice = () => {
        return cart.reduce(
            (total, item) => total + item.productPrice * item.quantity,
            0
        );
    };

    const getTotalItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalQuantityForProduct = (productId: string) => {
        return cart.reduce((total, item) => {
            return item.productId === productId ? total + item.quantity : total;
        }, 0);
    };

    const showAlert = (message: string) => {
        setAlertMessage(message);
        setTimeout(() => {
            setAlertMessage(null);
        }, 3000); // Hide alert after 3 seconds
    };

    const handleQuantityChange = (
        productId: string,
        colour: string,
        quantity: number,
        productName: string
    ) => {
        const availableQuantity = availableQuantities[productId] || 0;
        const cartItem = cart.find(
            (item) => item.productId === productId && item.colour === colour
        );
        const currentItemQuantity = cartItem?.quantity || 0;
        const newTotalQuantity =
            getTotalQuantityForProduct(productId) +
            quantity -
            currentItemQuantity;

        if (quantity > 0 && newTotalQuantity <= availableQuantity) {
            updateCartItemQuantity(productId, colour, quantity);
        } else if (quantity > 0) {
            showAlert(
                `Cannot add more than ${availableQuantity} ${productName}s.`
            );
        } else if (quantity < 1) {
            showAlert("Quantity cannot be less than 1.");
        }
    };

    if (!isClient) return null;

    return (
        <div className="fixed top-12 right-14 z-50">
            <div className="relative flex items-center">
                <button
                    ref={buttonRef}
                    onClick={toggleCart}
                    className="relative flex items-center text-black"
                >
                    <FontAwesomeIcon
                        icon={faShoppingBag}
                        className="mr-4 mt-2 mb-1 custom-icon-size"
                    />
                    {getTotalItemCount() > 0 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white text-sm rounded-full flex items-center justify-center">
                            {getTotalItemCount()}
                        </div>
                    )}
                </button>
                <Transition
                    show={isOpen}
                    enter="transition-opacity ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        ref={dropdownRef}
                        className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 shadow-lg z-50"
                    >
                        <div className="p-4">
                            {cart.length === 0 ? (
                                <p className="text-gray-500">
                                    Your cart is empty
                                </p>
                            ) : (
                                <>
                                    <div className="max-h-96 overflow-y-auto">
                                        {cart.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center py-2"
                                            >
                                                <div className="relative w-28 h-28">
                                                    <Image
                                                        src={item.imagePath}
                                                        alt={item.name}
                                                        fill
                                                        style={{
                                                            objectFit:
                                                                "contain",
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h2 className="text-lg font-bold text-black">
                                                        {item.name}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        Colour: {item.colour}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Price: £
                                                        {(
                                                            item.productPrice /
                                                            100
                                                        ).toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center mt-2">
                                                        <Button
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.productId,
                                                                    item.colour,
                                                                    item.quantity -
                                                                        1,
                                                                    item.name
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity <=
                                                                1
                                                            }
                                                            className="text-sm px-2 py-0.5 w-8"
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="mx-2 text-black w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.productId,
                                                                    item.colour,
                                                                    item.quantity +
                                                                        1,
                                                                    item.name
                                                                )
                                                            }
                                                            className="text-sm px-2 py-0.5 w-8"
                                                        >
                                                            +
                                                        </Button>
                                                        <button
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.productId,
                                                                    item.colour
                                                                )
                                                            }
                                                            className="ml-2 text-red-600 text-sm"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faTimesCircle
                                                                }
                                                                size="lg"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex justify-between text-lg font-bold text-black">
                                            <span>Total</span>
                                            <span>
                                                £
                                                {(
                                                    getTotalPrice() / 100
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push("/checkout");
                                            }}
                                            className="w-full mt-4"
                                        >
                                            Proceed to checkout
                                        </Button>
                                        <Transition
                                            show={!!alertMessage}
                                            enter="transition-opacity duration-300"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="transition-opacity duration-300"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="p-4 border border-gray-300 rounded-md bg-gray-100 text-gray-700 mt-4">
                                                {alertMessage}
                                            </div>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
}
