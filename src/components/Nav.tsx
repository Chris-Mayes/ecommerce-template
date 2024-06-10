"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import DropdownCart from "./DropdownCart";

export function Nav({ children }: { children: ReactNode }) {
    return (
        <nav className="nav-banner bg-primary text-primary-foreground flex items-center justify-between px-4 mb-24 shadow-">
            <div className="flex space-x-4 items-center justify-center flex-1">
                {children}
            </div>
            <div className="flex items-center ml-auto whitespace-nowrap">
                <NavLink href="/trackOrder">My Orders</NavLink>
                <DropdownCart></DropdownCart>
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
                    isActive ? "text-white" : "text-black hover:text-white"
                )}
            >
                {props.children}
            </span>
            <span
                className={cn(
                    "absolute inset-0 bottom-0 w-full h-full bg-black transition-transform duration-300 ease-in-out",
                    isActive
                        ? "translate-x-0"
                        : "translate-x-full group-hover:translate-x-0"
                )}
                style={{ zIndex: -1 }}
            />
        </Link>
    );
}
