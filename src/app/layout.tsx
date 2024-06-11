import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const lato = Montserrat({
    weight: ["100", "300", "400", "500", "600", "700", "900"],
    subsets: ["latin"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "Website Name",
    description: "A website description",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "bg-background min-h-screen font-sans antialiased",
                    lato.variable
                )}
            >
                <CartProvider>{children}</CartProvider>
            </body>
        </html>
    );
}
