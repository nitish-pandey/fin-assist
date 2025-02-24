import React, { useState, useCallback, useMemo } from "react";
import { Minus, Plus, X, Search } from "lucide-react";
import { Command } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
    id: string;
    name: string;
    price: number;
}

interface SelectedProduct {
    id: string;
    quantity: number;
}

interface ProductDetailsProps {
    products: Product[];
    onUpdateProducts: (products: SelectedProduct[]) => void;
}

export function ProductDetails({ products, onUpdateProducts }: ProductDetailsProps) {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
        { id: "", quantity: 1 },
    ]);

    const handleAddEmptySlot = useCallback(() => {
        setSelectedProducts((prev) => [...prev, { id: "", quantity: 1 }]);
    }, []);

    const handleProductSelect = useCallback((index: number, productId: string) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], id: productId };
            return updated;
        });
    }, []);

    const handleQuantityChange = useCallback((index: number, quantity: number) => {
        setSelectedProducts((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], quantity: Math.max(1, quantity) };
            return updated;
        });
    }, []);

    const handleRemoveProduct = useCallback((index: number) => {
        setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const getProductPrice = useCallback(
        (productId: string) => {
            return products.find((p) => p.id === productId)?.price || 0;
        },
        [products]
    );

    const totalAmount = useMemo(() => {
        return selectedProducts.reduce((total, item) => {
            return total + item.quantity * getProductPrice(item.id);
        }, 0);
    }, [selectedProducts, getProductPrice]);

    React.useEffect(() => {
        onUpdateProducts(selectedProducts);
    }, [selectedProducts, onUpdateProducts]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Item Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                        <div className="col-span-1">S.N.</div>
                        <div className="col-span-4">Item Name</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-1"></div>
                    </div>
                    <ScrollArea className="h-full max-h-[300px] pr-4 overflow-y-scroll">
                        {selectedProducts.map((item, index) => (
                            <ProductRow
                                key={index}
                                index={index}
                                item={item}
                                products={products}
                                getProductPrice={getProductPrice}
                                onProductSelect={handleProductSelect}
                                onQuantityChange={handleQuantityChange}
                                onRemoveProduct={handleRemoveProduct}
                            />
                        ))}
                    </ScrollArea>
                    <Button onClick={handleAddEmptySlot} className="w-full max-w-40 mx-auto">
                        + Add more product
                    </Button>
                    <div className="flex justify-end items-center space-x-2 font-medium">
                        <span>Total Amount:</span>
                        <span className="text-lg">${totalAmount.toFixed(2)}</span>
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
    getProductPrice: (id: string) => number;
    onProductSelect: (index: number, productId: string) => void;
    onQuantityChange: (index: number, quantity: number) => void;
    onRemoveProduct: (index: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = React.memo(
    ({
        index,
        item,
        products,
        getProductPrice,
        onProductSelect,
        onQuantityChange,
        onRemoveProduct,
    }) => {
        const [open, setOpen] = useState(false);
        const [searchValue, setSearchValue] = useState("");
        const price = getProductPrice(item.id);
        const amount = item.quantity * price;

        const selectedProduct = products.find((p) => p.id === item.id);

        return (
            <div className="grid grid-cols-12 gap-4 items-center py-2 w-full">
                <div className="col-span-1 text-sm text-muted-foreground">{index + 1}</div>
                <div className="col-span-4">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                {selectedProduct ? selectedProduct.name : "Select product..."}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <Input
                                    placeholder="Search products..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="border-none focus:ring-0"
                                />
                                <Command.List className="max-h-[300px] overflow-y-auto space-y-4">
                                    <Command.Empty>No products found.</Command.Empty>
                                    {products
                                        .filter((product) =>
                                            product.name
                                                .toLowerCase()
                                                .includes(searchValue.toLowerCase())
                                        )
                                        .map((product) => (
                                            <Command.Item
                                                key={product.id}
                                                onSelect={() => {
                                                    onProductSelect(index, product.id);
                                                    setOpen(false);
                                                }}
                                                className="p-2 hover:bg-gray-200 transition-all duration-300"
                                            >
                                                {product.name}
                                            </Command.Item>
                                        ))}
                                </Command.List>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onQuantityChange(index, item.quantity - 1)}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => onQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                            readOnly
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onQuantityChange(index, item.quantity + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="col-span-2">
                    <Input type="number" value={price.toFixed(2)} readOnly className="text-right" />
                </div>
                <div className="col-span-2">
                    <Input value={amount.toFixed(2)} readOnly className="text-right font-medium" />
                </div>
                <div className="col-span-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveProduct(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }
);

ProductRow.displayName = "ProductRow";
