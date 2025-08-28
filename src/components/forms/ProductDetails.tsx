"use client";

import React, {
    useMemo,
    useCallback,
    useState,
    useRef,
    useEffect,
} from "react";
import { Minus, Plus, X, Search, ChevronDown } from "lucide-react";
import { Command } from "cmdk";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product, ProductVariant } from "@/data/types";
// import CreateProductModal from "@/pages/admin/products/Create_product_modal";
import { Link } from "react-router-dom";
import { useOrg } from "@/providers/org-provider";

interface SelectedProduct {
    productId: string;
    variantId: string;
    quantity: number;
    rate: number;
}

interface ProductDetailsProps {
    type: "BUY" | "SELL";
    products: Product[];
    addedProducts: SelectedProduct[];
    onUpdateProducts: (products: SelectedProduct[]) => void;
}

// Validation function to check if all selected quantities are valid for sell orders
export const validateProductQuantities = (
    type: "BUY" | "SELL",
    products: Product[],
    addedProducts: (
        | SelectedProduct
        | {
              productId: string;
              variantId: string;
              quantity: number;
              rate?: number;
          }
    )[]
): { isValid: boolean; errors: string[] } => {
    if (type !== "SELL") {
        return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    addedProducts.forEach((item, index) => {
        if (!item.productId || !item.variantId) return;

        const variant = products
            .flatMap((p) => p.variants || [])
            .find((v) => v.id === item.variantId);

        if (variant && item.quantity > variant.stock) {
            const product = products.find((p) => p.id === item.productId);
            errors.push(
                `Item ${index + 1}: ${product?.name || "Unknown"} - ${
                    variant.name
                } quantity (${item.quantity}) exceeds available stock (${
                    variant.stock
                })`
            );
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export function ProductDetails({
    type,
    products,
    addedProducts,
    onUpdateProducts,
}: ProductDetailsProps) {
    const { orgId } = useOrg();

    // Validate quantities for sell orders
    const validation = useMemo(
        () => validateProductQuantities(type, products, addedProducts),
        [type, products, addedProducts]
    );

    const updateProductAtIndex = useCallback(
        (index: number, updates: Partial<SelectedProduct>) => {
            const updated = addedProducts.map((item, i) =>
                i === index ? { ...item, ...updates } : item
            );
            onUpdateProducts(updated);
        },
        [addedProducts, onUpdateProducts]
    );

    const handleAddEmptySlot = () => {
        onUpdateProducts([
            ...addedProducts,
            { productId: "", variantId: "", quantity: 1, rate: 0 },
        ]);
    };

    const handleRemoveProduct = (index: number) => {
        if (addedProducts.length === 1) {
            onUpdateProducts([
                { productId: "", variantId: "", quantity: 1, rate: 0 },
            ]);
        } else {
            onUpdateProducts(addedProducts.filter((_, i) => i !== index));
        }
    };

    const getProductDetails = (id: string) => products.find((p) => p.id === id);
    const getVariantDetails = (id: string) =>
        products.flatMap((p) => p.variants)?.find((v) => v && v.id === id);

    const totalAmount = useMemo(() => {
        return addedProducts.reduce(
            (total, item) => total + item.quantity * item.rate,
            0
        );
    }, [addedProducts]);

    const handleGlobalSelect = (item: Product, variant?: ProductVariant) => {
        const selectedVariant = variant || item.variants?.[0];
        const price =
            type === "BUY"
                ? selectedVariant?.buyPrice || 0
                : selectedVariant?.estimatedPrice || 0;

        const newProduct: SelectedProduct = {
            productId: item.id,
            variantId: selectedVariant?.id || "",
            quantity: 1,
            rate: price,
        };

        // Check if there's an empty slot to fill
        const emptySlotIndex = addedProducts.findIndex((p) => !p.productId);

        if (emptySlotIndex !== -1) {
            // Fill the empty slot
            updateProductAtIndex(emptySlotIndex, newProduct);
        } else {
            // Add new item
            onUpdateProducts([...addedProducts, newProduct]);
        }
    };

    return (
        <Card className="w-full border-0 shadow-none bg-gray-100">
            <div className="flex items-center gap-6 pt-4 px-6">
                <CardTitle className="text-lg font-semibold text-slate-800">
                    Item Details
                </CardTitle>

                {/* Global Search */}
                <GlobalSearchPopover
                    items={products}
                    type={type}
                    onSelect={handleGlobalSelect}
                />
            </div>

            {/* Validation Errors for Sell Orders */}
            {type === "SELL" && !validation.isValid && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-800 font-medium text-sm mb-2">
                        <span className="text-red-500">⚠️</span>
                        Stock Validation Errors:
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                        {validation.errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Product</div>
                    <div className="col-span-3">Variant</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate (Rs)</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1" />
                </div>

                <ScrollArea className="pr-4">
                    <div className="space-y-3">
                        {addedProducts.map((item, index) => {
                            const product = getProductDetails(item.productId);
                            const amount = item.quantity * item.rate;
                            const variant = getVariantDetails(item.variantId);

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border"
                                >
                                    <div className="col-span-1 font-medium">
                                        {index + 1}
                                    </div>

                                    {/* Product */}
                                    <div className="col-span-2">
                                        <SelectPopover
                                            items={products.map((p) => ({
                                                id: p.id,
                                                label: p.name,
                                            }))}
                                            selectedId={item.productId || ""}
                                            onSelect={(id) => {
                                                const selectedProduct =
                                                    products.find(
                                                        (p) => p.id === id
                                                    );
                                                const firstVariant =
                                                    selectedProduct
                                                        ?.variants?.[0];
                                                const price =
                                                    type === "BUY"
                                                        ? firstVariant?.buyPrice ||
                                                          0
                                                        : firstVariant?.estimatedPrice ||
                                                          0;
                                                updateProductAtIndex(index, {
                                                    productId: id,
                                                    variantId:
                                                        firstVariant?.id || "",
                                                    rate: price,
                                                });
                                            }}
                                            placeholder="Select product"
                                        />
                                    </div>

                                    {/* Variant */}
                                    <div className="col-span-3">
                                        {product ? (
                                            <SelectPopover
                                                items={(
                                                    product.variants ?? []
                                                ).map((v) => {
                                                    const price =
                                                        type === "BUY"
                                                            ? v.buyPrice
                                                            : v.estimatedPrice;
                                                    return {
                                                        id: v.id,
                                                        label: `${
                                                            v.name
                                                        } : Rs ${price.toFixed(
                                                            2
                                                        )}${
                                                            type === "SELL"
                                                                ? ` (Stock: ${v.stock})`
                                                                : ""
                                                        }`,
                                                    };
                                                })}
                                                selectedId={
                                                    item.variantId || ""
                                                }
                                                onSelect={(variantId) => {
                                                    const variant =
                                                        product.variants?.find(
                                                            (v) =>
                                                                v.id ===
                                                                variantId
                                                        );
                                                    if (variant) {
                                                        const price =
                                                            type === "BUY"
                                                                ? variant.buyPrice
                                                                : variant.estimatedPrice;
                                                        updateProductAtIndex(
                                                            index,
                                                            {
                                                                variantId:
                                                                    variant.id,
                                                                rate: price,
                                                            }
                                                        );
                                                    }
                                                }}
                                                placeholder="Select variant"
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Select product first
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                size="icon"
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    updateProductAtIndex(
                                                        index,
                                                        {
                                                            quantity: Math.max(
                                                                1,
                                                                item.quantity -
                                                                    1
                                                            ),
                                                        }
                                                    )
                                                }
                                                disabled={!item.variantId}
                                                className="h-8 w-8"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                min="1"
                                                max={
                                                    type === "SELL" && variant
                                                        ? variant.stock
                                                        : undefined
                                                }
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newQuantity =
                                                        parseInt(
                                                            e.target.value
                                                        );
                                                    updateProductAtIndex(
                                                        index,
                                                        {
                                                            quantity:
                                                                newQuantity,
                                                        }
                                                    );
                                                }}
                                                onBlur={(e) => {
                                                    let newQuantity = Math.max(
                                                        1,
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                    );

                                                    // For sell orders, also enforce stock limit
                                                    if (
                                                        type === "SELL" &&
                                                        variant
                                                    ) {
                                                        newQuantity = Math.min(
                                                            newQuantity,
                                                            variant.stock
                                                        );
                                                    }

                                                    updateProductAtIndex(
                                                        index,
                                                        {
                                                            quantity:
                                                                newQuantity,
                                                        }
                                                    );
                                                }}
                                                className={`w-28 h-8 text-center ${
                                                    type === "SELL" &&
                                                    variant &&
                                                    item.quantity >
                                                        variant.stock
                                                        ? "border-red-500 bg-red-50"
                                                        : ""
                                                }`}
                                            />
                                            <Button
                                                size="icon"
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const newQuantity =
                                                        item.quantity + 1;
                                                    // Check stock limit for sell orders
                                                    if (
                                                        type === "SELL" &&
                                                        variant &&
                                                        newQuantity >
                                                            variant.stock
                                                    ) {
                                                        return; // Don't allow increment beyond stock
                                                    }
                                                    updateProductAtIndex(
                                                        index,
                                                        {
                                                            quantity:
                                                                newQuantity,
                                                        }
                                                    );
                                                }}
                                                disabled={
                                                    !item.variantId ||
                                                    (type === "SELL" &&
                                                        variant &&
                                                        item.quantity >=
                                                            variant.stock)
                                                }
                                                className="h-8 w-8"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {/* Stock validation error message */}
                                        {type === "SELL" &&
                                            variant &&
                                            item.quantity > variant.stock && (
                                                <div className="text-xs text-red-500 mt-1 text-center">
                                                    Exceeds stock (
                                                    {variant.stock})
                                                </div>
                                            )}
                                    </div>

                                    {/* Rate */}
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) =>
                                                updateProductAtIndex(index, {
                                                    rate: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            onBlur={(e) =>
                                                updateProductAtIndex(index, {
                                                    rate:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                })
                                            }
                                            className="text-right h-9"
                                            disabled={!item.variantId}
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-1 text-right font-semibold whitespace-nowrap">
                                        Rs {amount.toFixed(2)}
                                    </div>

                                    {/* Remove */}
                                    <div className="col-span-1 flex gap-4 justify-center">
                                        <Button
                                            size="icon"
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                handleRemoveProduct(index)
                                            }
                                            className="h-8 w-8 text-slate-500 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* a tool tip to show the all the selected order */}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleAddEmptySlot}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add New Purchases
                        </Button>
                        {/* <CreateProductModal /> */}
                        <Link
                            to={`/org/${orgId}/products/create`}
                            className="text-sm text-blue-600 hover:underline border border-blue-600 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                        >
                            Create New Product
                        </Link>
                    </div>
                    <div className="text-lg font-semibold text-slate-700">
                        Total: Rs {totalAmount.toFixed(2)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SelectPopoverProps {
    items: { id: string; label: string }[];
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder?: string;
}

const SelectPopover: React.FC<SelectPopoverProps> = ({
    items,
    selectedId,
    onSelect,
    placeholder,
}) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const selectedItem = items.find((item) => item.id === selectedId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between truncate"
                >
                    {selectedItem && selectedId
                        ? selectedItem.label
                        : placeholder || "Select..."}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <div className="flex items-center px-3 border-b">
                        <Search className="mr-2 h-4 w-4 opacity-50" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-none focus:ring-0"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto py-1">
                        <Command.Empty className="py-6 text-center text-sm">
                            No results.
                        </Command.Empty>
                        {items
                            .filter((item) =>
                                item.label
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            )
                            .map((item) => (
                                <Command.Item
                                    key={item.id}
                                    value={item.id}
                                    onSelect={() => {
                                        onSelect(item.id);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-4 py-2 cursor-pointer hover:bg-slate-100 ${
                                        item.id === selectedId
                                            ? "bg-slate-200"
                                            : ""
                                    }`}
                                >
                                    {item.label}
                                </Command.Item>
                            ))}
                    </Command.List>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

interface SearchResult {
    type: "product" | "variant";
    product: Product;
    variant?: ProductVariant;
    id: string;
    displayName: string;
    price: number;
}

interface EnhancedSearchInputProps {
    items: Product[];
    onSelect: (item: Product, variant?: ProductVariant) => void;
    type: "BUY" | "SELL";
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

function GlobalSearchPopover({
    items,
    onSelect,
    type,
    placeholder = "Search products and variants...",
    className = "",
    autoFocus = false,
}: EnhancedSearchInputProps) {
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Create search results that include both products and variants
    const searchResults: SearchResult[] = useMemo(() => {
        const results: SearchResult[] = [];
        const lowerSearch = search.toLowerCase();

        items.forEach((product) => {
            const productMatches =
                product.name.toLowerCase().includes(lowerSearch) ||
                product.sku.toLowerCase().includes(lowerSearch) ||
                product.description?.toLowerCase().includes(lowerSearch);

            const variantMatches =
                product.variants?.filter(
                    (variant) =>
                        variant.name.toLowerCase().includes(lowerSearch) ||
                        variant.sku.toLowerCase().includes(lowerSearch) ||
                        variant.description?.toLowerCase().includes(lowerSearch)
                ) || [];

            // If product has only one variant, show as product
            if (
                product.variants?.length === 1 &&
                (productMatches || variantMatches.length > 0)
            ) {
                const variant = product.variants[0];
                const price =
                    type === "BUY" ? variant.buyPrice : variant.estimatedPrice;
                results.push({
                    type: "product",
                    product,
                    variant,
                    id: product.id,
                    displayName: product.name,
                    price,
                });
            }
            // If product has multiple variants
            else if (product.variants && product.variants.length > 1) {
                // Show matching variants
                variantMatches.forEach((variant) => {
                    const price =
                        type === "BUY"
                            ? variant.buyPrice
                            : variant.estimatedPrice;
                    results.push({
                        type: "variant",
                        product,
                        variant,
                        id: variant.id,
                        displayName: `${variant.name}`,
                        price,
                    });
                });

                // If product name matches but no variants match, show all variants
                if (productMatches && variantMatches.length === 0) {
                    product.variants.forEach((variant) => {
                        const price =
                            type === "BUY"
                                ? variant.buyPrice
                                : variant.estimatedPrice;
                        results.push({
                            type: "variant",
                            product,
                            variant,
                            id: variant.id,
                            displayName: `${product.name} - ${variant.name}`,
                            price,
                        });
                    });
                }
            }
            // If product has no variants and matches
            else if (!product.variants?.length && productMatches) {
                results.push({
                    type: "product",
                    product,
                    id: product.id,
                    displayName: product.name,
                    price: 0,
                });
            }
        });

        return results;
    }, [items, search, type]);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [search]);

    // Auto-select only if there's exactly one result and it's a single-variant product
    useEffect(() => {
        if (searchResults.length === 1 && search.length > 0) {
            const result = searchResults[0];
            // Only auto-select if it's a product (not showing multiple variants)
            if (result.type === "product") {
                onSelect(result.product, result.variant);
                setSearch("");
                inputRef.current?.blur();
            }
        }
    }, [searchResults, search, inputRef, onSelect]);

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (searchResults.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : searchResults.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (searchResults[highlightedIndex]) {
                    handleSelect(searchResults[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setShowResults(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSelect = (result: SearchResult) => {
        onSelect(result.product, result.variant);
        setSearch("");
        setShowResults(false);
        inputRef.current?.blur();
    };

    const handleItemClick = (result: SearchResult) => {
        handleSelect(result);
    };

    const handleFocus = () => {
        setShowResults(true);
    };

    const handleBlur = () => {
        // Small delay to allow for item clicks
        setTimeout(() => {
            setShowResults(false);
        }, 150);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center border rounded-md px-3 py-1 bg-white">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="border-none focus:ring-0 text-sm px-2 w-80"
                />
            </div>

            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-full max-h-80 overflow-y-auto">
                    {searchResults.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-500">
                            No products or variants found.
                        </div>
                    ) : (
                        searchResults.slice(0, 10).map((result, index) => (
                            <div
                                key={result.id}
                                onClick={() => handleItemClick(result)}
                                className={`px-4 py-3 w-full cursor-pointer border-b last:border-0 ${
                                    index === highlightedIndex
                                        ? "bg-blue-200 text-slate-900"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm truncate">
                                                {result.displayName}
                                            </span>
                                            {type === "SELL" &&
                                                result.variant && (
                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                                                        Stock:{" "}
                                                        {result.variant.stock}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 ml-3 whitespace-nowrap font-medium">
                                        Rs {result.price.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
