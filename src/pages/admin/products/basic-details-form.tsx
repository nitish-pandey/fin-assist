"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { Product } from "./types";
import { Category } from "@/data/types";
import { Label } from "@radix-ui/react-label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AddCategory from "@/components/modals/AddCategory";

// Define the validation schema
const formSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Product description is required"),
    price: z.coerce.number().min(0.01, "Price must be greater than zero"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

interface BasicDetailsFormProps {
    product: Product;
    categories: Category[];
    addCategory: (name: string, description: string) => Promise<void>;
    updateProduct: (data: Partial<Product>) => void;
    onNext: () => void;
}

export function BasicDetailsForm({
    product,
    updateProduct,
    onNext,
    addCategory,
    categories,
}: BasicDetailsFormProps) {
    // Initialize form with react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price || 0,
            stock: product.stock || 0,
        },
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(product.categoryId);

    // Update form values when product changes
    useEffect(() => {
        // Only reset the form if the values are different to avoid infinite loops
        if (
            product.name !== form.getValues("name") ||
            product.description !== form.getValues("description") ||
            product.price !== form.getValues("price") ||
            product.stock !== form.getValues("stock")
        ) {
            form.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
            });
        }
    }, [product, form]);

    // Handle form submission
    function onSubmit(values: z.infer<typeof formSchema>) {
        updateProduct({ ...values, categoryId: selectedCategoryId || "" });
        onNext();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Basic Details</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Product Name <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div>
                        <Label htmlFor="categoryId">Category</Label>
                        <div className="flex items-center justify-between">
                            <Select
                                onValueChange={(value) => setSelectedCategoryId(value)}
                                value={selectedCategoryId || undefined}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <AddCategory onAddCategory={addCategory} />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Description <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter product description"
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Base Price <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Stock <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            </Form>
        </div>
    );
}
