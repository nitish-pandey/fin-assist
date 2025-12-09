"use client";

import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Minus, Plus, X, Search, ChevronDown } from "lucide-react";
import { Command } from "cmdk";
import { Link } from "react-router-dom";

// UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types & Providers
import { Product, ProductVariant } from "@/data/types";
import { useOrg } from "@/providers/org-provider";

// --- TYPE DEFINITIONS ---

interface SelectedProduct {
    productId: string;
    variantId: string;
    quantity: number;
    rate: number;
    description: string;
}

interface ProductDetailsProps {
    type: "BUY" | "SELL";
    isPublic?: boolean;
    products: Product[];
    addedProducts: SelectedProduct[];
    onUpdateProducts: (products: SelectedProduct[]) => void;
}

// --- HELPER FUNCTIONS ---

const getVariantStock = (variant?: ProductVariant): number => {
    if (!variant?.stock_fifo_queue) return 0;
    console.log("Calculating stock for variant:", variant.id, variant.stock_fifo_queue);
    return variant.stock_fifo_queue.reduce((total, entry) => total + entry.availableStock, 0);
};

const getVariantEstimatedPrice = (variant: ProductVariant, quantity: number): number => {
    const totalStock = getVariantStock(variant);
    if (!variant.stock_fifo_queue || quantity <= 0 || quantity > totalStock) {
        return 0;
    }

    let remainingQty = quantity;
    let totalPrice = 0;

    for (const entry of variant.stock_fifo_queue) {
        if (entry.availableStock <= 0) continue;

        const qtyToUse = Math.min(entry.availableStock, remainingQty);
        totalPrice += qtyToUse * entry.estimatedPrice;
        remainingQty -= qtyToUse;
        if (remainingQty <= 0) break;
    }

    return parseFloat((totalPrice / quantity).toFixed(4)) || 0;
};

// --- VALIDATION ---

export const validateProductQuantities = (
    type: "BUY" | "SELL",
    products: Product[],
    addedProducts: SelectedProduct[]
): { isValid: boolean; errors: string[] } => {
    if (type !== "SELL") return { isValid: true, errors: [] };

    const errors: string[] = [];
    const variantMap = new Map(products.flatMap((p) => p.variants?.map((v) => [v.id, v]) ?? []));
    const productMap = new Map(products.map((p) => [p.id, p]));

    addedProducts.forEach((item, index) => {
        const variant = variantMap.get(item.variantId);
        if (variant && item.quantity > getVariantStock(variant)) {
            const product = productMap.get(item.productId);
            errors.push(
                `Item #${index + 1} (${product?.name} - ${variant.name}): Quantity (${
                    item.quantity
                }) exceeds available stock (${getVariantStock(variant)}).`
            );
        }
    });

    return { isValid: errors.length === 0, errors };
};

// =============================================
//               Main Component: ProductDetails
// =============================================
export function ProductDetails({
    type,
    isPublic = false,
    products,
    addedProducts,
    onUpdateProducts,
}: ProductDetailsProps) {
    const { orgId } = useOrg();

    // Memoize maps for efficient O(1) lookups instead of repeated .find() calls
    const { productMap, variantMap } = useMemo(() => {
        const pMap = new Map<string, Product>();
        const vMap = new Map<string, ProductVariant>();
        for (const product of products) {
            pMap.set(product.id, product);
            for (const variant of product.variants ?? []) {
                vMap.set(variant.id, variant);
            }
        }
        return { productMap: pMap, variantMap: vMap };
    }, [products]);

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
            { productId: "", variantId: "", quantity: 1, rate: 0, description: "" },
        ]);
    };

    const handleRemoveProduct = (index: number) => {
        if (addedProducts.length === 1) {
            onUpdateProducts([
                { productId: "", variantId: "", quantity: 1, rate: 0, description: "" },
            ]);
        } else {
            onUpdateProducts(addedProducts.filter((_, i) => i !== index));
        }
    };

    const handleGlobalSelect = (product: Product, variant?: ProductVariant) => {
        const myVar = variant || product.variants?.[0];
        if (!myVar) return;
        const price =
            type === "BUY" ? myVar.buyPrice || 0 : myVar.price || 0;

        const newProduct: SelectedProduct = {
            productId: product.id,
            variantId: myVar.id,
            quantity: 1,
            rate: price,
            description: "",
        };

        const emptySlotIndex = addedProducts.findIndex((p) => !p.productId);
        if (emptySlotIndex !== -1) {
            updateProductAtIndex(emptySlotIndex, newProduct);
        } else {
            onUpdateProducts([...addedProducts, newProduct]);
        }
    };

    const totalAmount = useMemo(
        () => addedProducts.reduce((total, item) => total + item.quantity * item.rate, 0),
        [addedProducts]
    );

    return (
        <Card className="w-full border-0 shadow-none bg-gray-100">
            <div className="flex items-center gap-6 pt-4 px-6">
                <CardTitle className="text-lg font-semibold text-slate-800">Item Details</CardTitle>
                <GlobalSearchPopover type={type} items={products} onSelect={handleGlobalSelect} />
            </div>

            {type === "SELL" && !validation.isValid && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-800 font-medium text-sm mb-2">
                        <span className="text-red-500">⚠️</span>
                        Stock Validation Errors:
                    </div>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <CardContent className="p-6 space-y-6">
                <div className="flex gap-4 font-medium text-sm text-muted-foreground bg-slate-50 p-3 rounded-md items-center">
                    <div className="w-6">#</div>
                    <div className="w-32">Product</div>
                    <div className="min-w-28 max-w-60 w-full">Variant</div>
                    <div className="w-24">Quantity</div>
                    <div className="w-24">Rate (Rs)</div>
                    <div className="w-28 text-right">Amount</div>
                    <div className="w-40">Remarks</div>
                    <div className="w-14" />
                </div>

                <ScrollArea className="pr-4 max-h-[50vh]">
                    <div className="space-y-3">
                        {addedProducts.map((item, index) => (
                            <ProductItemRow
                                key={index}
                                index={index}
                                item={item}
                                type={type}
                                isPublic={isPublic}
                                products={products}
                                product={productMap.get(item.productId)}
                                variant={variantMap.get(item.variantId)}
                                onUpdate={updateProductAtIndex}
                                onRemove={handleRemoveProduct}
                            />
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-4">
                        <Button type="button" onClick={handleAddEmptySlot} size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                        <Link
                            to={`/org/${orgId}/products/create`}
                            className="text-sm text-primary hover:underline"
                        >
                            Create New Product
                        </Link>
                    </div>
                    <div className="text-xl font-semibold text-slate-800">
                        Total: Rs {totalAmount.toFixed(2)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// =============================================
//               Row Component: ProductItemRow
// =============================================
interface ProductItemRowProps {
    index: number;
    item: SelectedProduct;
    type: "BUY" | "SELL";
    isPublic: boolean;
    products: Product[];
    product?: Product;
    variant?: ProductVariant;
    onUpdate: (index: number, updates: Partial<SelectedProduct>) => void;
    onRemove: (index: number) => void;
}

const ProductItemRow: React.FC<ProductItemRowProps> = ({
    index,
    item,
    type,
    isPublic,
    products,
    product,
    variant,
    onUpdate,
    onRemove,
}) => {
    const stock = getVariantStock(variant);
    const hasStockError = type === "SELL" && item.quantity > stock;
    const amount = item.quantity * item.rate;

    const handleProductSelect = (productId: string) => {
        const selectedProduct = products.find((p) => p.id === productId);
        const firstVariant = selectedProduct?.variants?.[0];
        if (!firstVariant) return;

        const rate =
            type === "BUY"
                ? firstVariant.buyPrice
                : firstVariant.price;

        onUpdate(index, { productId, variantId: firstVariant.id, rate });
    };

    const handleVariantSelect = (variantId: string) => {
        const selectedVariant = product?.variants?.find((v) => v.id === variantId);
        if (!selectedVariant) return;

        const rate =
            type === "BUY"
                ? selectedVariant.buyPrice
                : selectedVariant.price;

        onUpdate(index, { variantId, rate });
    };

    const handleQuantityChange = (newQuantity: number) => {
        let quantity = Math.max(1, newQuantity || 1);
        if (type === "SELL" && variant) {
            quantity = Math.min(quantity, stock);
        }

        const updates: Partial<SelectedProduct> = { quantity };
        if (type === "SELL" && variant) {
            updates.rate = variant.price;
        }
        onUpdate(index, updates);
    };

    const handleRateChange = (newRate: number) => {
        onUpdate(index, { rate: Math.max(0, newRate || 0) });
    };

    return (
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg border">
            <div className="col-span-1 w-6 font-medium text-slate-600 text-sm">{index + 1}</div>
            <div className="col-span-2 w-32">
                <SelectPopover
                    items={products.map((p) => ({ id: p.id, label: p.name }))}
                    selectedId={item.productId}
                    onSelect={handleProductSelect}
                    placeholder="Select product"
                />
            </div>
            <div className="col-span-2 max-w-60">
                {product ? (
                    <SelectPopover
                        items={(product.variants ?? []).map((v) => ({
                            id: v.id,
                            label: `${v.name.replace(product.name + "-", "")}${
                                type === "SELL"
                                    ? ` (Stock: ${getVariantStock(v)})${
                                          !isPublic
                                              ? ` - Estimate: ${getVariantEstimatedPrice(v, 1)}`
                                              : ""
                                      }`
                                    : !isPublic
                                    ? " - Last Bought At: Rs " + v.buyPrice
                                    : ""
                            }`,
                        }))}
                        selectedId={item.variantId}
                        onSelect={handleVariantSelect}
                        placeholder="Select variant"
                    />
                ) : (
                    <span className="text-sm text-muted-foreground px-3">Select product first</span>
                )}
            </div>
            <div className="col-span-2 w-24">
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        type="button"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        disabled={!item.variantId || item.quantity <= 1}
                        className="h-8 w-8"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                        type="number"
                        min="1"
                        max={type === "SELL" ? stock : undefined}
                        value={item.quantity}
                        onChange={(e) => onUpdate(index, { quantity: parseInt(e.target.value) })}
                        onBlur={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className={`w-16 h-8 text-center ${
                            hasStockError && product ? "border-red-500 bg-red-50" : ""
                        }`}
                        disabled={!item.variantId}
                    />
                    <Button
                        size="icon"
                        type="button"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        disabled={!item.variantId || (type === "SELL" && item.quantity >= stock)}
                        className="h-8 w-8"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                {hasStockError && product && (
                    <div className="text-xs text-red-500 mt-1 text-center">Exceeds stock</div>
                )}
            </div>
            <div className="col-span-2 w-24">
                <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    className="text-right h-9"
                    // disabled={!item.variantId || type === "SELL"}
                />
            </div>
            <div className="col-span-1 w-28 text-right font-semibold text-slate-700 whitespace-nowrap">
                {amount.toFixed(2)}
            </div>
            <div className="col-span-1 w-40">
                <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(index, { description: e.target.value })}
                    placeholder="Remarks"
                    className="h-9"
                    disabled={!item.variantId}
                />
            </div>
            <div className="col-span-1 w-14 flex justify-center items-center gap-2">
                <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => onRemove(index)}
                    className="h-8 w-8 text-slate-500 hover:text-red-500"
                >
                    <X className="h-4 w-4" />
                </Button>

                {/* Show FIFO queue breakdown tooltip for SELL transactions */}
                {type === "SELL" && variant?.stock_fifo_queue && item.quantity > 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                                    i
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm bg-gray-200 text-black">
                                <div className="text-xs space-y-1">
                                    <div className="font-medium text-slate-800 mb-2">
                                        Price Breakdown:
                                    </div>
                                    {(() => {
                                        let remainingQty = item.quantity;
                                        const breakdown: { qty: number; price: number }[] = [];

                                        for (const entry of variant.stock_fifo_queue) {
                                            if (entry.availableStock <= 0 || remainingQty <= 0)
                                                continue;

                                            const qtyToUse = Math.min(
                                                entry.availableStock,
                                                remainingQty
                                            );
                                            breakdown.push({
                                                qty: qtyToUse,
                                                price: entry.estimatedPrice,
                                            });
                                            remainingQty -= qtyToUse;
                                        }

                                        return breakdown.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex justify-between text-slate-600"
                                            >
                                                <span>{item.qty} items</span>
                                                <span>@ Rs {item.price.toFixed(2)}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
};

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
                    className="w-full justify-between truncate text-sm"
                >
                    {selectedItem && selectedId ? selectedItem.label : placeholder || "Select..."}
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
                                item.label.toLowerCase().includes(search.toLowerCase())
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
                                    className={`px-4 py-2 text-xs cursor-pointer hover:bg-slate-100 ${
                                        item.id === selectedId ? "bg-slate-200" : ""
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
            if (product.variants?.length === 1 && (productMatches || variantMatches.length > 0)) {
                const variant = product.variants[0];
                const price =
                    type === "BUY" ? variant.buyPrice : variant.price;
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
                        type === "BUY" ? variant.buyPrice : variant.price;
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
                                : variant.price;
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
                setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
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
                                <div className="flex justify-between items-start w-full text-[10px]">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm truncate">
                                                {result.displayName}
                                            </span>
                                            {type === "SELL" && result.variant && (
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                                                    Stock: {getVariantStock(result.variant)}
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
