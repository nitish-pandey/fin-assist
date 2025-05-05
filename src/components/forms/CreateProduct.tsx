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
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { Category, Product } from "@/data/types";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CreateProductFormProps {
    orgId: string;
    afterCreate?: (product: Product) => void;
}

interface CreateProductFormData {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
}

const CreateProduct: React.FC<CreateProductFormProps> = ({ orgId, afterCreate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await (await api.get<Category[]>(`/orgs/${orgId}/category`)).data;
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                toast({
                    title: "Error",
                    description: "Could not load categories.",
                    variant: "destructive",
                });
            }
        };
        fetchCategories();
    }, [orgId]);

    const onSubmit: SubmitHandler<CreateProductFormData> = async (data) => {
        setIsLoading(true);
        try {
            const createdProduct = await api.post(`/orgs/${orgId}/products`, data);
            if (afterCreate) {
                afterCreate(createdProduct.data);
            }
            reset();
            toast({
                title: "Success",
                description: "Product has been added successfully!",
            });
            // Close the dialog if needed
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create product:", error);
            toast({
                title: "Error",
                description: "Could not create product.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button>Add New Product</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                        <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter product name"
                                {...register("name", { required: "Required" })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter description"
                                {...register("description")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register("price", { required: "Required" })}
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm">{errors.price.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    {...register("stock", { required: "Required" })}
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-sm">{errors.stock.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="categoryId">Category</Label>
                            <Select
                                onValueChange={(value) => setValue("categoryId", value)}
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
                        </div>

                        <div className="flex justify-end space-x-3">
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
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreateProduct;
