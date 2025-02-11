"use client";

import type React from "react";
import { useState, useMemo } from "react";
import type { Product } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface AddProductDialogProps {
    products: Product[];
    onAddProduct: (productId: string) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ products, onAddProduct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [addedProducts, setAddedProducts] = useState<string[]>([]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleAddProduct = (productId: string) => {
        onAddProduct(productId);
        setAddedProducts((prev) => [...prev, productId]);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchTerm("");
        setAddedProducts([]);
    };

    return (
        <>
            <Button type="button" onClick={() => setIsOpen(true)}>
                Add Products
            </Button>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>Add Products</DialogHeader>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <ScrollArea className="h-[300px] pr-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="grid grid-cols-3 gap-3 py-2">
                                <span>{product.name}</span>
                                <span className="text-sm">Current Stock- {product.stock}</span>
                                <Button
                                    onClick={() => handleAddProduct(product.id)}
                                    disabled={addedProducts.includes(product.id)}
                                    size="sm"
                                >
                                    {addedProducts.includes(product.id) ? "Added" : "Add"}
                                </Button>
                            </div>
                        ))}
                    </ScrollArea>
                    <Button type="button" onClick={handleClose} className="mt-4">
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddProductDialog;
