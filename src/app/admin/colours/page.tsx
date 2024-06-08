"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ColoursPage() {
    const router = useRouter();
    const [colours, setColours] = useState<{ id: string; name: string }[]>([]);
    const [newColour, setNewColour] = useState("");

    useEffect(() => {
        async function fetchColours() {
            const res = await fetch("/api/colours");
            const data = await res.json();
            setColours(data);
        }

        fetchColours();
    }, []);

    const addColour = async () => {
        if (!newColour) return;
        const res = await fetch("/api/colours", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newColour }),
        });
        const data = await res.json();
        setColours((prev) => [...prev, data]);
        setNewColour("");
    };

    const deleteColour = async (id: string) => {
        await fetch(`/api/colours/${id}`, {
            method: "DELETE",
        });
        setColours((prev) => prev.filter((colour) => colour.id !== id));
    };

    return (
        <div className="p-4">
            <div className="pb-4">
                <Button onClick={() => router.back()}>Back</Button>
            </div>
            <h1 className="text-xl font-bold mb-4">Manage Colours</h1>
            <div className="flex space-x-2 mb-4">
                <Input
                    type="text"
                    value={newColour}
                    onChange={(e) => setNewColour(e.target.value)}
                    placeholder="New colour name"
                />
                <Button onClick={addColour}>Add Colour</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {colours.map((colour) => (
                        <TableRow key={colour.id}>
                            <TableCell>{colour.name}</TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => deleteColour(colour.id)}
                                    variant="destructive"
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
