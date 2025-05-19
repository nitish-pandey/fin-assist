"use client";
import type React from "react";

import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { ProductVariant } from "./types";
import { Loader2 } from "lucide-react";

interface VariantsFormProps {
    variants: ProductVariant[];
    updateVariants: (variants: ProductVariant[]) => void;
    isLoading: boolean;
}

export function VariantsForm({ variants, updateVariants, isLoading }: VariantsFormProps) {
    // Get all unique option names for table headers
    const optionNames =
        variants.length > 0
            ? Object.keys(variants[0].options).filter((key) => key !== "undefined")
            : [];

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        const newVariants = [...variants];

        if (field === "price" || field === "stock") {
            newVariants[index][field] = value === "" ? 0 : Number.parseFloat(value);
        } else {
            newVariants[index][field] = value;
        }

        updateVariants(newVariants);
    };

    // Handle keyboard navigation in the table
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        rowIndex: number,
        field: string
    ) => {
        if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
            // Move to the next row, same column
            if (rowIndex < variants.length - 1) {
                e.preventDefault();
                const nextRow = document.querySelector(
                    `#variant-${rowIndex + 1}-${field}`
                ) as HTMLElement;
                if (nextRow) nextRow.focus();
            }
        } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
            // Move to the previous row, same column
            if (rowIndex > 0) {
                e.preventDefault();
                const prevRow = document.querySelector(
                    `#variant-${rowIndex - 1}-${field}`
                ) as HTMLElement;
                if (prevRow) prevRow.focus();
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Product Variants</h2>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Generating variants...</p>
                </div>
            ) : variants.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No variants available</h3>
                    <p className="text-muted-foreground">
                        Add product options first to generate variants
                    </p>
                </div>
            ) : (
                <>
                    <div className="border rounded-md overflow-hidden">
                        <div className="max-h-[400px] overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        {optionNames.map((option) => (
                                            <TableHead key={option} className="font-medium">
                                                {option}
                                            </TableHead>
                                        ))}
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {variants.map((variant, index) => (
                                        <TableRow key={index} className="group">
                                            {optionNames.map((option) => (
                                                <TableCell key={option} className="font-medium">
                                                    {variant.options[option]}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Input
                                                    id={`variant-${index}-sku`}
                                                    value={variant.sku}
                                                    onChange={(e) =>
                                                        updateVariant(index, "sku", e.target.value)
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(e, index, "sku")
                                                    }
                                                    className="h-8 bg-transparent"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    id={`variant-${index}-price`}
                                                    type="number"
                                                    value={variant.price || ""}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(e, index, "price")
                                                    }
                                                    min="0"
                                                    step="0.01"
                                                    className="h-8 bg-transparent"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    id={`variant-${index}-stock`}
                                                    type="number"
                                                    value={variant.stock || ""}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "stock",
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(e, index, "stock")
                                                    }
                                                    min="0"
                                                    step="1"
                                                    className="h-8 bg-transparent"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
