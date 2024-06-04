import React from "react";
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
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
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
                <TableRow className="border-b-2 border-gray-800">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Colour</TableHead>
                    <TableHead className="whitespace-nowrap">
                        Price Paid
                    </TableHead>
                    <TableHead className="w-0">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order, orderIndex) => {
                    const totalPrice = order.items.reduce(
                        (sum, item) => sum + item.priceInPence * item.quantity,
                        0
                    );

                    return (
                        <React.Fragment key={order.id}>
                            {order.items.map((item, itemIndex) => (
                                <TableRow
                                    key={item.id}
                                    className={
                                        itemIndex === order.items.length - 1
                                            ? "border-b border-gray-800"
                                            : "border-b border-gray-400"
                                    }
                                >
                                    {itemIndex === 0 && (
                                        <TableCell rowSpan={order.items.length}>
                                            {order.id}
                                        </TableCell>
                                    )}
                                    {itemIndex === 0 && (
                                        <TableCell rowSpan={order.items.length}>
                                            {order.user.name}
                                            <br />
                                            {order.user.email}
                                        </TableCell>
                                    )}
                                    {itemIndex === 0 && (
                                        <TableCell rowSpan={order.items.length}>
                                            {`${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}`}
                                        </TableCell>
                                    )}
                                    <TableCell>{item.product.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.colour}</TableCell>
                                    {itemIndex === 0 && (
                                        <TableCell
                                            rowSpan={order.items.length}
                                            className="text-center align-middle"
                                        >
                                            {formatCurrency(totalPrice / 100)}
                                        </TableCell>
                                    )}
                                    {itemIndex === 0 && (
                                        <TableCell
                                            className="text-center"
                                            rowSpan={order.items.length}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <MoreVertical />
                                                    <span className="sr-only">
                                                        Actions
                                                    </span>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DeleteDropDownItem
                                                        id={order.id}
                                                    />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </React.Fragment>
                    );
                })}
            </TableBody>
        </Table>
    );
}
