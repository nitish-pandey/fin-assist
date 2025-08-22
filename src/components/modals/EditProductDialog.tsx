import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { Product } from "@/data/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface EditProductDialogProps {
    product: Product | null;
    orgId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedProduct: Product) => void;
}

interface EditProductFormData {
    name: string;
    description: string;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
    product,
    orgId,
    isOpen,
    onClose,
    onUpdate,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<EditProductFormData>({
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Update form values when product changes
    useEffect(() => {
        if (product) {
            setValue("name", product.name);
            setValue("description", product.description || "");
        } else {
            reset();
        }
    }, [product, setValue, reset]);

    const onSubmit: SubmitHandler<EditProductFormData> = async (data) => {
        if (!product) return;

        setIsLoading(true);
        try {
            const response = await api.put(`/orgs/${orgId}/products/${product.id}`, {
                name: data.name,
                description: data.description,
            });

            const updatedProduct = response.data;

            if (onUpdate) {
                onUpdate(updatedProduct);
            }

            toast({
                title: "Success",
                description: "Product has been updated successfully!",
            });

            onClose();
        } catch (error) {
            console.error("Failed to update product:", error);
            toast({
                title: "Error",
                description: "Could not update product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter product name"
                            {...register("name", { 
                                required: "Product name is required",
                                minLength: {
                                    value: 2,
                                    message: "Product name must be at least 2 characters"
                                }
                            })}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter product description (optional)"
                            rows={4}
                            {...register("description")}
                            disabled={isLoading}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductDialog;
