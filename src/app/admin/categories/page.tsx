"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<
        { id: string; name: string }[]
    >([]);
    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        }

        fetchCategories();
    }, []);

    const addCategory = async () => {
        if (!newCategory) return;
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newCategory }),
        });
        const data = await res.json();
        setCategories((prev) => [...prev, data]);
        setNewCategory("");
    };

    const deleteCategory = async (id: string) => {
        await fetch(`/api/categories/${id}`, {
            method: "DELETE",
        });
        setCategories((prev) => prev.filter((category) => category.id !== id));
    };

    return (
        <div className="p-4">
            <Button onClick={() => router.back()}>Back</Button>
            <h1 className="text-xl font-bold mb-4">Manage Categories</h1>
            <div className="flex space-x-2 mb-4">
                <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                />
                <Button onClick={addCategory}>Add Category</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => deleteCategory(category.id)}
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
