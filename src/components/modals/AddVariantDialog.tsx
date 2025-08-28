import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { Product, ProductVariant } from "@/data/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductOptions {
    name: string;
    slug: string;
    values: {
        value: string;
        slug: string;
    }[];
}

interface ProductWithOptions extends Product {
    options?: ProductOptions[];
}

interface AddVariantDialogProps {
    product: ProductWithOptions | null;
    orgId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (newVariant: ProductVariant) => void;
}

interface AddVariantFormData {
    name: string;
    description: string;
    buyPrice: number;
    estimatedPrice: number;
    stock: number;
    code: string;
    sku: string;
    selectedOptions: { [optionSlug: string]: string }; // optionSlug -> valueSlug
}

interface AvailableVariantCombination {
    name: string;
    values: { [optionSlug: string]: string };
    isSelected: boolean;
}

const AddVariantDialog: React.FC<AddVariantDialogProps> = ({
    product,
    orgId,
    isOpen,
    onClose,
    onUpdate,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [availableCombinations, setAvailableCombinations] = useState<
        AvailableVariantCombination[]
    >([]);
    const [selectedCombination, setSelectedCombination] =
        useState<AvailableVariantCombination | null>(null);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<AddVariantFormData>({
        defaultValues: {
            name: "",
            description: "",
            buyPrice: 0,
            estimatedPrice: 0,
            stock: 0,
            code: "",
            sku: "",
            selectedOptions: {},
        },
    });

    // Get product options from product.options
    const productOptions = product?.options || [];

    // Calculate available combinations when dialog opens or product changes
    useEffect(() => {
        if (!isOpen || !product) return;

        // Calculate available combinations
        calculateAvailableCombinations(productOptions, product.variants || []);
    }, [isOpen, product, productOptions]);

    // Calculate which variant combinations are available (not already created)
    const calculateAvailableCombinations = (
        options: ProductOptions[],
        existingVariants: ProductVariant[]
    ) => {
        if (
            !options.length ||
            options.every((option) => !option.values.length)
        ) {
            setAvailableCombinations([]);
            return;
        }

        // Generate all possible combinations
        const generateAllCombinations = (
            optionIndex: number,
            currentCombination: { [key: string]: string }
        ): { [key: string]: string }[] => {
            if (optionIndex >= options.length) {
                return [{ ...currentCombination }];
            }

            const currentOption = options[optionIndex];
            const combinations: { [key: string]: string }[] = [];

            currentOption.values.forEach((value) => {
                const newCombination = {
                    ...currentCombination,
                    [currentOption.slug]: value.slug,
                };
                combinations.push(
                    ...generateAllCombinations(optionIndex + 1, newCombination)
                );
            });

            return combinations;
        };

        const allCombinations = generateAllCombinations(0, {});

        // Filter out combinations that already exist as variants
        const availableCombinations = allCombinations.filter((combination) => {
            return !existingVariants.some((variant) => {
                // Check if variant.values matches this combination
                const variantValues =
                    (variant.values as { [key: string]: string }) || {};
                return Object.keys(combination).every(
                    (optionSlug) =>
                        variantValues[optionSlug] === combination[optionSlug]
                );
            });
        });

        // Convert to display format
        const formattedCombinations: AvailableVariantCombination[] =
            availableCombinations.map((combination) => {
                const nameParts: string[] = [];

                Object.entries(combination).forEach(
                    ([optionSlug, valueSlug]) => {
                        const option = options.find(
                            (o) => o.slug === optionSlug
                        );
                        const value = option?.values.find(
                            (v) => v.slug === valueSlug
                        );

                        if (option && value) {
                            nameParts.push(`${option.name}: ${value.value}`);
                        }
                    }
                );

                return {
                    name: nameParts.join(", "),
                    values: combination,
                    isSelected: false,
                };
            });

        setAvailableCombinations(formattedCombinations);
        if (formattedCombinations.length > 0) {
            setSelectedCombination(formattedCombinations[0]);
        }
    };

    // Generate SKU when combination is selected
    useEffect(() => {
        if (selectedCombination && product) {
            const skuParts: string[] = [];
            Object.entries(selectedCombination.values).forEach(
                ([, valueSlug]) => {
                    skuParts.push(valueSlug);
                }
            );

            const generatedSKU = `${product.sku}-${skuParts.join("-")}`;
            const generatedName = `${product.name} - ${selectedCombination.name}`;

            setValue("sku", generatedSKU);
            setValue("name", generatedName);
            setValue("code", generatedSKU); // Use SKU as default code
        }
    }, [selectedCombination, product?.sku, product?.name, setValue]);

    const onSubmit: SubmitHandler<AddVariantFormData> = async (data) => {
        if (!product || !selectedCombination) {
            toast({
                title: "Error",
                description: "Please select a variant combination.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const variantData = {
                name: data.name,
                description: data.description,
                buyPrice: parseFloat(data.buyPrice.toString()),
                estimatedPrice: parseFloat(data.estimatedPrice.toString()),
                stock: parseInt(data.stock.toString()),
                code: data.code,
                sku: data.sku,
                values: selectedCombination.values,
            };

            const response = await api.post(
                `/orgs/${orgId}/products/${product.id}/variants`,
                variantData
            );

            const newVariant = response.data;

            if (onUpdate) {
                onUpdate(newVariant);
            }

            toast({
                title: "Success",
                description: "Variant has been added successfully!",
            });

            handleClose();
        } catch (error) {
            console.error("Failed to add variant:", error);
            toast({
                title: "Error",
                description: "Could not add variant. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            reset();
            setSelectedCombination(null);
            onClose();
        }
    };

    const selectCombination = (combination: AvailableVariantCombination) => {
        setSelectedCombination(combination);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Variant</DialogTitle>
                </DialogHeader>

                {!product ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Product information is not available.
                        </AlertDescription>
                    </Alert>
                ) : productOptions.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This product doesn't have any options defined. You
                            need to add options to the product first to create
                            variants with different combinations.
                        </AlertDescription>
                    </Alert>
                ) : availableCombinations.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            All possible variant combinations have already been
                            created for this product.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Available Combinations Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Select Variant Combination
                            </Label>
                            <div className="grid gap-3 max-h-[200px] overflow-y-auto border rounded-md p-3">
                                {availableCombinations.map(
                                    (combination, index) => (
                                        <Card
                                            key={index}
                                            className={`cursor-pointer transition-all hover:bg-accent ${
                                                selectedCombination ===
                                                combination
                                                    ? "ring-2 ring-primary bg-accent"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                selectCombination(combination)
                                            }
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {combination.name}
                                                        </div>
                                                        <div className="flex gap-1 mt-1 flex-wrap">
                                                            {Object.entries(
                                                                combination.values
                                                            ).map(
                                                                ([
                                                                    optionSlug,
                                                                    valueSlug,
                                                                ]) => {
                                                                    const option =
                                                                        productOptions.find(
                                                                            (
                                                                                o
                                                                            ) =>
                                                                                o.slug ===
                                                                                optionSlug
                                                                        );
                                                                    const value =
                                                                        option?.values.find(
                                                                            (
                                                                                v
                                                                            ) =>
                                                                                v.slug ===
                                                                                valueSlug
                                                                        );
                                                                    return (
                                                                        <Badge
                                                                            key={
                                                                                optionSlug
                                                                            }
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            {
                                                                                option?.name
                                                                            }
                                                                            :{" "}
                                                                            {
                                                                                value?.value
                                                                            }
                                                                        </Badge>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedCombination ===
                                                        combination && (
                                                        <div className="ml-2">
                                                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full bg-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                )}
                            </div>
                        </div>

                        {selectedCombination && (
                            <>
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Variant Name
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter variant name"
                                            {...register("name", {
                                                required:
                                                    "Variant name is required",
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
                                                required:
                                                    "Variant code is required",
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
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter variant description (optional)"
                                        rows={3}
                                        {...register("description")}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Pricing and Stock */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="buyPrice">
                                            Buy Price
                                        </Label>
                                        <Input
                                            id="buyPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            {...register("buyPrice", {
                                                required:
                                                    "Buy price is required",
                                                min: {
                                                    value: 0,
                                                    message:
                                                        "Buy price must be positive",
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
                                                required:
                                                    "Selling price is required",
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
                                    <Label htmlFor="stock">
                                        Stock Quantity
                                    </Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register("stock", {
                                            required:
                                                "Stock quantity is required",
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
                            </>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            {selectedCombination && (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Adding..." : "Add Variant"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddVariantDialog;
