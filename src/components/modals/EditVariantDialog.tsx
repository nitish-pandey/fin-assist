import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { ProductVariant } from "@/data/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface EditVariantDialogProps {
    variant: ProductVariant | null;
    productId: string;
    orgId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedVariant: ProductVariant) => void;
}

interface EditVariantFormData {
    name: string;
    description: string;
    buyPrice: number;
    estimatedPrice: number;
    stock: number;
    code: string;
    sku: string;
}

const EditVariantDialog: React.FC<EditVariantDialogProps> = ({
    variant,
    productId,
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
    } = useForm<EditVariantFormData>({
        defaultValues: {
            name: "",
            description: "",
            buyPrice: 0,
            estimatedPrice: 0,
            stock: 0,
            code: "",
            sku: "",
        },
    });

    // Update form values when variant changes
    useEffect(() => {
        if (variant) {
            setValue("name", variant.name);
            setValue("description", variant.description || "");
            setValue("buyPrice", variant.buyPrice);
            setValue("estimatedPrice", variant.estimatedPrice);
            setValue("stock", variant.stock);
            setValue("code", variant.code);
            setValue("sku", variant.sku);
        } else {
            reset();
        }
    }, [variant, setValue, reset]);

    const onSubmit: SubmitHandler<EditVariantFormData> = async (data) => {
        if (!variant) return;

        setIsLoading(true);
        try {
            const response = await api.put(
                `/orgs/${orgId}/products/${productId}/variants/${variant.id}`,
                {
                    name: data.name,
                    description: data.description,
                    buyPrice: parseFloat(data.buyPrice.toString()),
                    estimatedPrice: parseFloat(data.estimatedPrice.toString()),
                    stock: parseInt(data.stock.toString()),
                    code: data.code,
                    sku: data.sku,
                }
            );

            const updatedVariant = response.data;

            if (onUpdate) {
                onUpdate(updatedVariant);
            }

            toast({
                title: "Success",
                description: "Variant has been updated successfully!",
            });

            onClose();
        } catch (error) {
            console.error("Failed to update variant:", error);
            toast({
                title: "Error",
                description: "Could not update variant. Please try again.",
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
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Edit Variant</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Variant Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter variant name"
                                {...register("name", {
                                    required: "Variant name is required",
                                    minLength: {
                                        value: 2,
                                        message:
                                            "Variant name must be at least 2 characters",
                                    },
                                })}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                placeholder="Enter variant code"
                                {...register("code", {
                                    required: "Variant code is required",
                                })}
                                disabled={isLoading}
                            />
                            {errors.code && (
                                <p className="text-red-500 text-sm">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            placeholder="Enter SKU"
                            {...register("sku", {
                                required: "SKU is required",
                            })}
                            disabled={isLoading}
                        />
                        {errors.sku && (
                            <p className="text-red-500 text-sm">
                                {errors.sku.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter variant description (optional)"
                            rows={3}
                            {...register("description")}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buyPrice">Buy Price</Label>
                            <Input
                                id="buyPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register("buyPrice", {
                                    required: "Buy price is required",
                                    min: {
                                        value: 0,
                                        message: "Buy price must be positive",
                                    },
                                })}
                                disabled={isLoading}
                            />
                            {errors.buyPrice && (
                                <p className="text-red-500 text-sm">
                                    {errors.buyPrice.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedPrice">
                                Selling Price
                            </Label>
                            <Input
                                id="estimatedPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register("estimatedPrice", {
                                    required: "Selling price is required",
                                    min: {
                                        value: 0,
                                        message:
                                            "Selling price must be positive",
                                    },
                                })}
                                disabled={isLoading}
                            />
                            {errors.estimatedPrice && (
                                <p className="text-red-500 text-sm">
                                    {errors.estimatedPrice.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                            id="stock"
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register("stock", {
                                required: "Stock quantity is required",
                                min: {
                                    value: 0,
                                    message:
                                        "Stock quantity must be non-negative",
                                },
                            })}
                            disabled={isLoading}
                        />
                        {errors.stock && (
                            <p className="text-red-500 text-sm">
                                {errors.stock.message}
                            </p>
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
                            {isLoading ? "Updating..." : "Update Variant"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditVariantDialog;
