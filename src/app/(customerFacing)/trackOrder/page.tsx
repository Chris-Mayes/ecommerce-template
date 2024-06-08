"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function OrderTrackingPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState("");

    const fetchOrderStatus = async () => {
        setError("");
        const res = await fetch(`/api/order-tracking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, email }),
        });
        const data = await res.json();

        if (res.status === 200) {
            setOrder(data);
        } else {
            setOrder(null);
            setError(data.message);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>
            <div className="space-y-4">
                <Input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Order ID"
                    className="w-full"
                />
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full"
                />
                <Button onClick={fetchOrderStatus} className="w-full">
                    Track Order
                </Button>
                {error && <p className="text-red-500">{error}</p>}
                {order && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">
                            Order Status: {order.status}
                        </h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.product.name}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            {`£${(
                                                (item.priceInPence *
                                                    item.quantity) /
                                                100
                                            ).toFixed(2)}`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
