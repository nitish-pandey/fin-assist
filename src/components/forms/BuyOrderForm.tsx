"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import AddPaymentDialog from "../modals/AddPaymentDialog";
import AddEntity from "../modals/AddEntity";
import { Entity, Product, Account } from "@/data/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
interface BuyProductFormProps {
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<void>;
    onSubmit: (
        products: { id: string; quantity: number }[],
        payments: { amount: number; accountId: string }[],
        entityId?: string,
        billFiles?: File[]
    ) => Promise<void> | void;
}

export default function BuyProductForm({
    entities,
    products,
    accounts,
    onSubmit,
    addEntity,
}: BuyProductFormProps) {
    const [open, setOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>(
        []
    );
    const [selectedPayments, setSelectedPayments] = useState<
        { amount: number; accountId: string }[]
    >([]);
    const [billFiles, setBillFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Calculate the total price of selected products.
    const totalProductPrice = useMemo(() => {
        return selectedProducts.reduce((acc, prod) => {
            const product = products.find((p) => p.id === prod.id);
            return acc + prod.quantity * (product?.price || 0);
        }, 0);
    }, [selectedProducts, products]);

    // Calculate the total payment amount.
    const totalPayments = useMemo(() => {
        return selectedPayments.reduce((acc, payment) => acc + payment.amount, 0);
    }, [selectedPayments]);

    // Calculate the remaining amount.
    const remainingAmount = totalProductPrice - totalPayments;

    const removePayment = useCallback((index: number) => {
        setSelectedPayments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const clearForm = useCallback(() => {
        setSelectedEntity(null);
        setSelectedProducts([]);
        setSelectedPayments([]);
        setBillFiles([]);
        setError(null);
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            // Validate entity selection.
            if (!selectedEntity) {
                setError("Please select an entity.");
                return;
            }
            const filteredProducts = selectedProducts.filter(
                (product) => product.quantity > 0 && product.id
            );
            // Validate product selection.
            if (filteredProducts.length === 0) {
                setError("Please select at least one product.");
                return;
            }
            // Validate payment completion.
            if (selectedPayments.length === 0) {
                setError("Payment is not completed yet. Please add at least one payment.");
                return;
            }
            // Optionally, validate that bill files are uploaded if required.
            // if (billFiles.length === 0) {
            //   setError("Please upload at least one bill file.");
            //   return;
            // }

            try {
                await onSubmit(filteredProducts, selectedPayments, selectedEntity.id, billFiles);
                clearForm();
                toast({
                    title: "Purchase Successful",
                    description: "The product has been purchased successfully.",
                    variant: "default",
                });
            } catch (err) {
                setError("An error occurred during submission. Please try again.");
            }
        },
        [selectedEntity, selectedProducts, selectedPayments, billFiles, onSubmit, clearForm, toast]
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-2">Buy Product</h2>
            <p className="text-muted-foreground mb-8">
                Add product to buy and select client to buy.
            </p>

            <form onSubmit={handleSubmit}>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                        <p className="text-sm text-muted-foreground">Add information of client</p>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Select Entity</Label>
                                <div className="flex gap-2">
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                            >
                                                {selectedEntity
                                                    ? selectedEntity.name
                                                    : "Select entity..."}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search entity..." />
                                                <CommandList>
                                                    <CommandEmpty>No entity found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {entities.map((entity) => (
                                                            <CommandItem
                                                                key={entity.id}
                                                                onSelect={() => {
                                                                    setSelectedEntity(entity);
                                                                    setOpen(false);
                                                                }}
                                                            >
                                                                {entity.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <AddEntity addEntity={addEntity} text="Add New" />
                                    {selectedEntity && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedEntity(null)}
                                            title="Clear Selected Entity"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Entity Details</Label>
                                <div className="p-4 border border-muted-foreground rounded-lg">
                                    {selectedEntity ? (
                                        <div>
                                            <p className="font-semibold">{selectedEntity.name}</p>
                                            <p>{selectedEntity.phone}</p>
                                            <p>{selectedEntity.email}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No entity selected</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ProductDetails products={products} onUpdateProducts={setSelectedProducts} />

                <Card className="my-8">
                    <CardHeader>
                        <CardTitle>Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Selected Payments</h3>
                                <AddPaymentDialog
                                    type="BUY"
                                    accounts={accounts}
                                    remainingAmount={remainingAmount}
                                    onAddPayment={(amount, accountId) =>
                                        setSelectedPayments((prev) => [
                                            ...prev,
                                            { amount, accountId },
                                        ])
                                    }
                                />
                            </div>

                            {selectedProducts.length > 0 && remainingAmount > 0 && (
                                <div className="p-3 bg-blue-50 text-blue-600 rounded">
                                    Payment is not completed yet.
                                </div>
                            )}

                            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                {selectedPayments.length === 0 ? (
                                    <p className="text-muted-foreground text-center">
                                        No payments added.
                                    </p>
                                ) : (
                                    selectedPayments.map((payment, index) => {
                                        const accountDetails = accounts.find(
                                            (a) => a.id === payment.accountId
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b last:border-b-0"
                                            >
                                                <div className="flex-1 flex gap-4">
                                                    <span className="font-medium">
                                                        {accountDetails?.name}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ({accountDetails?.type})
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">
                                                        ${payment.amount.toFixed(2)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removePayment(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
                <BillUpload onUpload={setBillFiles} />
                {error && (
                    <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-600 rounded">
                        {error}
                    </div>
                )}
                <Button type="submit" className="w-full py-6 text-lg">
                    Buy
                </Button>
            </form>
        </div>
    );
}

interface BillUploadProps {
    onUpload: (files: File[]) => void;
    error?: string;
}

const BillUpload: React.FC<BillUploadProps> = ({ onUpload, error }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newFiles = [...selectedFiles, ...files];
            setSelectedFiles(newFiles);
            onUpload(newFiles);
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onUpload(newFiles);
    };

    return (
        <div className="space-y-2 py-8">
            <div className="flex items-center justify-between">
                <Label className="text-xl">Bill Files</Label>
                <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    id="bill-upload"
                />
                <label
                    htmlFor="bill-upload"
                    className="flex items-center justify-center w-32 h-12 border border-dashed border-primary rounded-lg cursor-pointer"
                >
                    <span className="text-primary">Upload Bill</span>
                </label>
            </div>
            <div className="mt-4">
                {selectedFiles.length === 0 ? (
                    <p className="text-muted-foreground text-center">No files uploaded.</p>
                ) : (
                    <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between border p-2 rounded"
                            >
                                <span className="truncate">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFile(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};
