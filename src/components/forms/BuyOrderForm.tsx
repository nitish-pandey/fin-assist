"use client";

import React, { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
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

interface BuyProductFormProps {
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<void>;
    onSubmit: (data: any) => void;
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

    const removePayment = useCallback((index: number) => {
        setSelectedPayments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedEntity) return;
            onSubmit({ entity: selectedEntity, selectedProducts, selectedPayments });
        },
        [selectedEntity, selectedProducts, selectedPayments, onSubmit]
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-2">Buy Product</h2>
            <p className="text-muted-foreground mb-8">
                Add product to buy and select client to buy
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
                                    onAddPayment={(amount, accountId) =>
                                        setSelectedPayments((prev) => [
                                            ...prev,
                                            { amount, accountId },
                                        ])
                                    }
                                />
                            </div>
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
                <Button type="submit" className="w-full py-6 text-lg">
                    Buy
                </Button>
            </form>
        </div>
    );
}
