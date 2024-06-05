"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import DropdownCart from "@/components/DropdownCart";

export function Nav({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isCheckoutPage = pathname === "/checkout";

    return (
        <nav className="nav-banner bg-primary text-primary-foreground flex items-center justify-between px-4">
            <div className="flex space-x-4 items-center">{children}</div>
            {!isCheckoutPage && (
                <div className="flex items-center ml-4 mr-6 mt-6">
                    <DropdownCart />
                </div>
            )}
        </nav>
    );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
    const pathname = usePathname();
    return (
        <Link
            {...props}
            className={cn(
                "relative p-4 text-black before:absolute \
                 before:bottom-[5px] \
                 before:left-1/2 \
                 before:-translate-x-1/2 \
                 before:h-[3px] \
                 before:w-0 \
                 before:bg-black \
                 before:transition-all \
                 before:duration-300 \
                 before:ease-in-out \
                 hover:before:w-3/4",
                pathname === props.href && "before:w-3/4"
            )}
        />
    );
}
