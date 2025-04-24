"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Minus, Plus, X, Search, DollarSign } from "lucide-react";
import { Command } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    price: number;
}

interface SelectedProduct {
    id: string;
    quantity: number;
    rate: number;
}

interface ProductDetailsProps {
    products: Product[];
    onUpdateProducts: (products: SelectedProduct[]) => void;
}

export function ProductDetails({ products, onUpdateProducts }: ProductDetailsProps) {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
        { id: "", quantity: 1, rate: 0 },
    ]);

    const handleAddEmptySlot = useCallback(() => {
        setSelectedProducts((prev) => [...prev, { id: "", quantity: 1, rate: 0 }]);
    }, []);

    const handleProductSelect = useCallback(
        (index: number, productId: string) => {
            const product = products.find((p) => p.id === productId);
            const basePrice = product?.price || 0;

            setSelectedProducts((prev) => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    id: productId,
                    rate: basePrice, // Set the initial rate to the base price
                };
                return updated;
            });
        },
        [products]
    );

    const handleQuantityChange = useCallback((index: number, quantity: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], quantity: Math.max(1, quantity) };
            return updated;
        });
    }, []);

    const handleRateChange = useCallback((index: number, rate: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], rate };
            return updated;
        });
    }, []);

    const handleRemoveProduct = useCallback((index: number) => {
        setSelectedProducts((prev) => {
            if (prev.length === 1) {
                return [{ id: "", quantity: 1, rate: 0 }];
            }
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const getProductDetails = useCallback(
        (productId: string) => {
            return products.find((p) => p.id === productId);
        },
        [products]
    );

    const totalAmount = useMemo(() => {
        return selectedProducts.reduce((total, item) => {
            return total + item.quantity * item.rate;
        }, 0);
    }, [selectedProducts]);

    React.useEffect(() => {
        onUpdateProducts(selectedProducts);
    }, [selectedProducts]);

    return (
        <Card className="w-full border rounded-lg shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Item Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Item Name</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-center">Rate ($)</div>
                        <div className="col-span-2 text-center">Amount ($)</div>
                        <div className="col-span-1"></div>
                    </div>
                    <ScrollArea className="h-full max-h-[350px] pr-4 overflow-y-auto">
                        <div className="space-y-3">
                            {selectedProducts.map((item, index) => (
                                <ProductRow
                                    key={`product-${index}`}
                                    index={index}
                                    item={item}
                                    products={products}
                                    getProductDetails={getProductDetails}
                                    onProductSelect={handleProductSelect}
                                    onQuantityChange={handleQuantityChange}
                                    onRateChange={handleRateChange}
                                    onRemoveProduct={handleRemoveProduct}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Button
                            onClick={handleAddEmptySlot}
                            className="w-full sm:w-auto bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                            type="button"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-medium">Total:</span>
                            <Badge
                                variant="outline"
                                className="text-lg font-semibold px-3 py-1.5 bg-slate-50"
                            >
                                ${totalAmount.toFixed(2)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface ProductRowProps {
    index: number;
    item: SelectedProduct;
    products: Product[];
    getProductDetails: (id: string) => Product | undefined;
    onProductSelect: (index: number, productId: string) => void;
    onQuantityChange: (index: number, quantity: number) => void;
    onRateChange: (index: number, rate: number) => void;
    onRemoveProduct: (index: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = React.memo(
    ({
        index,
        item,
        products,
        getProductDetails,
        onProductSelect,
        onQuantityChange,
        onRateChange,
        onRemoveProduct,
    }) => {
        const [open, setOpen] = useState(false);
        const [searchValue, setSearchValue] = useState("");
        const amount = item.quantity * item.rate;

        const selectedProduct = getProductDetails(item.id);
        const isCustomRate = selectedProduct && item.rate !== selectedProduct.price;

        return (
            <div
                className={cn(
                    "grid grid-cols-12 gap-4 items-center py-3 px-2 w-full rounded-lg transition-all duration-200",
                    item.id ? "bg-white border" : "bg-slate-50 border border-dashed"
                )}
            >
                <div className="col-span-1 text-sm font-medium">{index + 1}</div>
                <div className="col-span-4">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    "w-full justify-between transition-all",
                                    selectedProduct
                                        ? "bg-white"
                                        : "bg-slate-50 border-slate-200 text-slate-500"
                                )}
                            >
                                {selectedProduct ? (
                                    <span className="truncate">{selectedProduct.name}</span>
                                ) : (
                                    "Select product..."
                                )}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <div className="flex items-center px-3 border-b">
                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>
                                <Command.List className="max-h-[300px] overflow-y-auto py-2">
                                    <Command.Empty className="py-6 text-center text-sm">
                                        No products found.
                                    </Command.Empty>
                                    {products
                                        .filter((product) =>
                                            product.name
                                                .toLowerCase()
                                                .includes(searchValue.toLowerCase())
                                        )
                                        .map((product) => (
                                            <Command.Item
                                                key={product.id}
                                                value={product.id}
                                                onSelect={() => {
                                                    onProductSelect(index, product.id);
                                                    setOpen(false);
                                                    setSearchValue("");
                                                }}
                                                className="px-4 py-2 mx-1 rounded-md cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
                                            >
                                                <div className="flex justify-between w-full">
                                                    <span>{product.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            </Command.Item>
                                        ))}
                                </Command.List>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center justify-center space-x-1">
                        <Button
                            size="icon"
                            variant="outline"
                            type="button"
                            onClick={() => onQuantityChange(index, item.quantity - 1)}
                            className="h-8 w-8"
                            disabled={!item.id}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                                onQuantityChange(index, Number.parseInt(e.target.value) || 1)
                            }
                            className="w-14 h-8 text-center"
                            min="1"
                            disabled={!item.id}
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            type="button"
                            onClick={() => onQuantityChange(index, item.quantity + 1)}
                            className="h-8 w-8"
                            disabled={!item.id}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                <div className="col-span-2">
                    <Input
                        type="number"
                        value={item.rate.toFixed(2)}
                        onChange={(e) =>
                            onRateChange(index, Number.parseFloat(e.target.value) || 0)
                        }
                        className={cn(
                            "text-right h-9",
                            isCustomRate ? "border-amber-300 bg-amber-50" : ""
                        )}
                        disabled={!item.id}
                        step="0.01"
                    />
                </div>
                <div className="col-span-2">
                    <div
                        className={cn(
                            "bg-slate-50 border rounded-md py-1.5 px-3 text-right font-medium",
                            amount > 0 ? "text-slate-900" : "text-slate-400"
                        )}
                    >
                        {amount.toFixed(2)}
                    </div>
                </div>
                <div className="col-span-1 flex justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => onRemoveProduct(index)}
                        className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }
);

ProductRow.displayName = "ProductRow";
