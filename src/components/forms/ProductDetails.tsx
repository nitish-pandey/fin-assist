"use client";

import React, { useState, useMemo } from "react";
import { Minus, Plus, X, Search, DollarSign, ChevronDown } from "lucide-react";
import { Command } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/data/types";

interface SelectedProduct {
    productId: string;
    id: string; // variant id
    quantity: number;
    rate: number;
}

interface ProductDetailsProps {
    products: Product[];
    onUpdateProducts: (products: SelectedProduct[]) => void;
}

export function ProductDetails({ products, onUpdateProducts }: ProductDetailsProps) {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
        { productId: "", id: "", quantity: 1, rate: 0 },
    ]);

    const handleAddEmptySlot = () => {
        setSelectedProducts((prev) => [...prev, { productId: "", id: "", quantity: 1, rate: 0 }]);
    };

    const handleProductSelect = (index: number, productId: string) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                productId,
                id: "",
                rate: 0,
            };
            return updated;
        });
    };

    const handleVariantSelect = (index: number, variantId: string, rate: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                id: variantId,
                rate,
            };
            return updated;
        });
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], quantity: Math.max(1, quantity) };
            return updated;
        });
    };

    const handleRateChange = (index: number, rate: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], rate };
            return updated;
        });
    };

    const handleRemoveProduct = (index: number) => {
        setSelectedProducts((prev) => {
            if (prev.length === 1) return [{ productId: "", id: "", quantity: 1, rate: 0 }];
            return prev.filter((_, i) => i !== index);
        });
    };

    const getProductDetails = (id: string) => products.find((p) => p.id === id);

    const totalAmount = useMemo(() => {
        return selectedProducts.reduce((total, item) => total + item.quantity * item.rate, 0);
    }, [selectedProducts]);

    React.useEffect(() => {
        onUpdateProducts(selectedProducts);
    }, [selectedProducts]);

    return (
        <Card className="w-full border rounded-xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-t-xl">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Item Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Product</div>
                    <div className="col-span-3">Variant</div>
                    <div className="col-span-2 ">Quantity</div>
                    <div className="col-span-2">Rate ($)</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1" />
                </div>

                <ScrollArea className="max-h-[400px] pr-4">
                    <div className="space-y-3">
                        {selectedProducts.map((item, index) => {
                            const product = getProductDetails(item.productId);
                            const amount = item.quantity * item.rate;

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border"
                                >
                                    <div className="col-span-1 font-medium">{index + 1}</div>

                                    {/* Product Dropdown */}
                                    <div className="col-span-2">
                                        <SelectPopover
                                            items={products.map((p) => ({
                                                id: p.id,
                                                label: p.name,
                                            }))}
                                            selectedId={item.productId}
                                            onSelect={(id) => handleProductSelect(index, id)}
                                            placeholder="Select product"
                                        />
                                    </div>

                                    {/* Variant Dropdown */}
                                    <div className="col-span-3">
                                        {product ? (
                                            <SelectPopover
                                                items={(product?.variants ?? []).map((v) => ({
                                                    id: v.id,
                                                    label: `${v.name} - $${v.price.toFixed(2)}`,
                                                }))}
                                                selectedId={item.id}
                                                onSelect={(id) => {
                                                    const v = product.variants?.find(
                                                        (x) => x.id === id
                                                    );
                                                    if (v)
                                                        handleVariantSelect(index, v.id, v.price);
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
                                    <div className="col-span-2 flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleQuantityChange(index, item.quantity - 1)
                                            }
                                            disabled={!item.id}
                                            className="h-8 w-8"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    index,
                                                    Number.parseInt(e.target.value) || 1
                                                )
                                            }
                                            min={1}
                                            className="w-14 h-8 text-center"
                                        />
                                        <Button
                                            size="icon"
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleQuantityChange(index, item.quantity + 1)
                                            }
                                            disabled={!item.id}
                                            className="h-8 w-8"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Rate */}
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            value={item.rate.toFixed(2)}
                                            onChange={(e) =>
                                                handleRateChange(
                                                    index,
                                                    Number.parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="text-right h-9"
                                            disabled={!item.id}
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-1 text-right font-semibold">
                                        ${amount.toFixed(2)}
                                    </div>

                                    {/* Remove */}
                                    <div className="col-span-1 flex justify-center">
                                        <Button
                                            size="icon"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleRemoveProduct(index)}
                                            className="h-8 w-8 text-slate-500 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center">
                    <Button
                        type="button"
                        onClick={handleAddEmptySlot}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Product
                    </Button>
                    <div className="text-lg font-semibold text-slate-700">
                        Total: ${totalAmount.toFixed(2)}
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
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selectedItem = items.find((item) => item.id === selectedId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedItem ? selectedItem.label : placeholder || "Select..."}
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
                                    className="px-4 py-2 cursor-pointer hover:bg-slate-100"
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
