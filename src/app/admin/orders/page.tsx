"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
    id: string;
    product: { name: string };
    quantity: number;
    priceInPence: number;
    colour: string;
}

interface ShippingAddress {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
}

interface User {
    email: string;
}

interface Order {
    id: string;
    user: User;
    customerName: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    status: string;
    createdAt: string;
}

export default function OrdersPage() {
    return (
        <>
            <PageHeader title="Sales" description="Manage your orders" />
            <OrdersTable />
        </>
    );
}

function OrdersTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders");
                const data = await response.json();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const deleteOrder = async (orderId: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.id !== orderId)
            );
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
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
                    <TableHead>Status</TableHead>
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
                                            {order.customerName} <br />
                                            {order.user.email}
                                        </TableCell>
                                    )}
                                    {itemIndex === 0 && (
                                        <TableCell rowSpan={order.items.length}>
                                            {order.shippingAddress?.line1}
                                            <br />
                                            {order.shippingAddress?.city}
                                            <br />
                                            {order.shippingAddress?.postalCode}
                                            <br />
                                            {order.shippingAddress?.country}
                                        </TableCell>
                                    )}
                                    <TableCell>{item.product.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.colour}</TableCell>
                                    {itemIndex === 0 && (
                                        <TableCell rowSpan={order.items.length}>
                                            <OrderStatus
                                                orderId={order.id}
                                                status={order.status}
                                            />
                                        </TableCell>
                                    )}
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
                                                        onDelete={() =>
                                                            deleteOrder(
                                                                order.id
                                                            )
                                                        }
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

function OrderStatus({ orderId, status }: { orderId: string; status: string }) {
    const [currentStatus, setCurrentStatus] = useState(status);

    const updateStatus = async (newStatus: string) => {
        setCurrentStatus(newStatus);
        await fetch(`/api/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        });
    };

    return (
        <div>
            <select
                value={currentStatus}
                onChange={(e) => updateStatus(e.target.value)}
                className="border border-gray-300 rounded p-1"
            >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
    );
}

function DeleteDropDownItem({
    id,
    onDelete,
}: {
    id: string;
    onDelete: () => void;
}) {
    return (
        <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 block px-4 py-2 text-sm"
        >
            Delete
        </button>
    );
}
