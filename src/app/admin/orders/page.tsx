import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { DeleteDropDownItem } from "./_components/OrderActions";

async function getOrders() {
    return db.order.findMany({
        select: {
            id: true,
            user: { select: { email: true } },
            items: {
                select: {
                    id: true,
                    product: { select: { name: true } },
                    quantity: true,
                    priceInPence: true,
                    colour: true,
                },
            },
            shippingAddress: {
                select: {
                    line1: true,
                    city: true,
                    postalCode: true,
                    country: true,
                },
            },
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export default function OrdersPage() {
    return (
        <>
            <PageHeader title="Sales" description="Manage your orders" />
            <OrdersTable />
        </>
    );
}

async function OrdersTable() {
    const orders = await getOrders();

    if (orders.length === 0) return <p>No sales found</p>;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Colour</TableHead>
                    <TableHead>Price Paid</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead className="w-0">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) =>
                    order.items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>{order.user.email}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.colour}</TableCell>
                            <TableCell>
                                {formatCurrency(item.priceInPence / 100)}
                            </TableCell>
                            <TableCell>
                                {`${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}`}
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVertical />
                                        <span className="sr-only">Actions</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DeleteDropDownItem id={order.id} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
