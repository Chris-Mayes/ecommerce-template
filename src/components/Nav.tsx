"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import DropdownCart from "./DropdownCart";

export function Nav({ children }: { children: ReactNode }) {
    return (
        <nav className="nav-banner bg-primary text-primary-foreground flex items-center justify-between px-4 mb-24 shadow-lg">
            <div className="flex-1 flex justify-center">
                <div className="flex space-x-4">{children}</div>
            </div>
            <div className="absolute right-4 flex items-center whitespace-nowrap">
                <NavLink href="/trackOrder">My Orders</NavLink>
                <DropdownCart />
            </div>
        </nav>
    );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
    const pathname = usePathname();
    const isActive = pathname === props.href;

    return (
        <Link
            {...props}
            className="relative inline-block p-4 text-white transition duration-300 ease-in-out"
        >
            <span
                className={cn(
                    "transition-all duration-200 ease-in-out",
                    "text-white"
                )}
            >
                {props.children}
            </span>
            <span
                className={cn(
                    "absolute left-1/2 bottom-0 w-1 h-1 mb-2 rounded-full bg-white transition-transform duration-300 ease-in-out transform -translate-x-1/2",
                    isActive ? "scale-100" : "scale-0"
                )}
            />
        </Link>
    );
}
