"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
    return (
        <nav className="nav-banner bg-primary text-primary-foreground">
            {children}
        </nav>
    );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
    const pathname = usePathname();
    return (
        <Link
            {...props}
            className={cn(
                "relative p-4 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-[3px] before:w-0 before:bg-white before:transition-all before:duration-300 before:ease-in-out hover:before:w-3/4",
                pathname === props.href && "before:w-3/4"
            )}
        />
    );
}
