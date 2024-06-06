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
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<
        { id: string; name: string; order: number }[]
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

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = categories.findIndex(
                (category) => category.id === active.id
            );
            const newIndex = categories.findIndex(
                (category) => category.id === over.id
            );
            const newCategories = arrayMove(categories, oldIndex, newIndex).map(
                (
                    category: { id: string; name: string; order: number },
                    index: number
                ) => ({
                    ...category,
                    order: index,
                })
            );
            setCategories(newCategories);

            await fetch("/api/categories", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ categories: newCategories }),
            });
        }
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
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={categories}
                    strategy={verticalListSortingStrategy}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <SortableItem
                                    key={category.id}
                                    id={category.id}
                                    category={category}
                                    deleteCategory={deleteCategory}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </SortableContext>
            </DndContext>
        </div>
    );
}

function SortableItem({
    id,
    category,
    deleteCategory,
}: {
    id: string;
    category: { id: string; name: string; order: number };
    deleteCategory: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
    );
}
