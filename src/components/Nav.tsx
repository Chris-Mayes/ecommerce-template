"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
    return (
        <nav className="nav-banner bg-primary text-primary-foreground">
            <div className="flex flex-1 justify-start space-x-4 items-start">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img src="/logo2.png" alt="Logo" className="h-56 w-auto" />
            </div>
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
