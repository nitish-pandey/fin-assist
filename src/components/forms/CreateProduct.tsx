import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/data/types";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";

interface CreateProductFormProps {
    orgId: string;
}

interface CreateProductFormData {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
}

const CreateProduct: React.FC<CreateProductFormProps> = ({ orgId }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CreateProductFormData>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: "",
        },
    });

    const selectedCategoryId = watch("categoryId");
    const { toast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await (await api.get<Category[]>(`/orgs/${orgId}/category`)).data;
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                toast({
                    title: "Failed to fetch categories",
                    description: "Please try again.",
                });
            }
        };

        fetchCategories();
    }, [orgId]);

    const onSubmit: SubmitHandler<CreateProductFormData> = async (data) => {
        setIsLoading(true);
        try {
            await api.post(`/orgs/${orgId}/products`, data);
            reset();
            toast({
                title: "Product created",
                description: "The new product has been successfully added.",
            });
        } catch (error) {
            console.error("Failed to create product:", error);
            toast({
                title: "Error",
                description: "Failed to create the product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter product name"
                            {...register("name", {
                                required: "Product name is required",
                            })}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500" aria-live="polite">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter product description"
                            {...register("description")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="Enter product price"
                                {...register("price", {
                                    required: "Price is required",
                                    min: {
                                        value: 0,
                                        message: "Price must be a positive number",
                                    },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500" aria-live="polite">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                placeholder="Enter product stock"
                                {...register("stock", {
                                    required: "Stock is required",
                                    min: {
                                        value: 0,
                                        message: "Stock must be a non-negative integer",
                                    },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.stock && (
                                <p className="text-sm text-red-500" aria-live="polite">
                                    {errors.stock.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Category</Label>
                        <Select
                            onValueChange={(value) =>
                                setValue("categoryId", value, {
                                    shouldValidate: true,
                                })
                            }
                            value={selectedCategoryId || undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.length === 0 ? (
                                    <SelectItem value="no-categories">
                                        No categories available
                                    </SelectItem>
                                ) : (
                                    categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-sm text-red-500" aria-live="polite">
                                {errors.categoryId.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Product"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateProduct;
