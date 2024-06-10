import { Nav, NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Nav>
                <NavLink href="/products">Shop</NavLink>
                <NavLink href="/">Explore</NavLink>
                {/* <NavLink href="/products">Home</NavLink> */}
                {/* <NavLink href="/products">Products</NavLink> */}
            </Nav>
            <div className="container my-6">{children}</div>
        </>
    );
}
