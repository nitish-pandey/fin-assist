"use client";

import type React from "react";
import { useState, useMemo } from "react";
import type { Entity, Product, Account } from "@/data/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Trash2 } from "lucide-react";
// import AddProductDialog from "./modals/AddProductDialog";
// import AddPaymentDialog from "./modals/AddPaymentDialog";
// import SelectEntityDialog from "./modals/SelectEntityDialog";
import AddProductDialog from "../modals/AddProductDialog";
import AddPaymentDialog from "../modals/AddPaymentDialog";
import SelectEntityDialog from "../modals/SelectEntityDialog";

interface CreateOrderFormProps {
    products: Product[];
    entities: Entity[];
    accounts: Account[];
    onCreateOrder: (
        type: "BUY" | "SELL",
        products: { id: string; quantity: number }[],
        payments: { amount: number; accountId: string }[],
        entityId?: string
    ) => void;
}

export function CreateOrderForm({
    products,
    entities,
    accounts,
    onCreateOrder,
}: CreateOrderFormProps) {
    const [type, setType] = useState<"BUY" | "SELL">("BUY");
    const [selectedProducts, setSelectedProducts] = useState<
        { id: string; quantity: number }[]
    >([]);
    const [selectedPayments, setSelectedPayments] = useState<
        { amount: number; accountId: string }[]
    >([]);
    const [selectedEntity, setSelectedEntity] = useState<Entity | undefined>();

    const totalProductsAmount = useMemo(() => {
        return selectedProducts.reduce((sum, product) => {
            const productDetails = products.find((p) => p.id === product.id);
            return (
                sum + (productDetails?.estimatedPrice || 0) * product.quantity
            );
        }, 0);
    }, [selectedProducts, products]);

    const totalPaymentsAmount = useMemo(() => {
        return selectedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );
    }, [selectedPayments]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCreateOrder(
            type,
            selectedProducts,
            selectedPayments,
            selectedEntity?.id
        );
    };

    const adjustProductQuantity = (index: number, change: number) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].quantity = Math.max(
            1,
            updatedProducts[index].quantity + change
        );
        setSelectedProducts(updatedProducts);
    };

    const removeProduct = (index: number) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    const removePayment = (index: number) => {
        setSelectedPayments(selectedPayments.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        Create New Order
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="products" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                            <TabsTrigger value="entity">Entity</TabsTrigger>
                        </TabsList>
                        <TabsContent value="products">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">
                                        Selected Products
                                    </h3>
                                    <AddProductDialog
                                        products={products}
                                        onAddProduct={(id) => {
                                            setSelectedProducts([
                                                ...selectedProducts,
                                                { id, quantity: 1 },
                                            ]);
                                        }}
                                    />
                                </div>
                                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                    {selectedProducts.map((product, index) => {
                                        const productDetails = products.find(
                                            (p) => p.id === product.id
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b last:border-b-0"
                                            >
                                                <div className="flex-1">
                                                    <span className="font-medium">
                                                        {productDetails?.name}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-2"
                                                    >
                                                        Rs
                                                        {productDetails?.estimatedPrice.toFixed(
                                                            2
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            adjustProductQuantity(
                                                                index,
                                                                -1
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center">
                                                        {product.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            adjustProductQuantity(
                                                                index,
                                                                1
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeProduct(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="w-24 text-right">
                                                    Rs
                                                    {(
                                                        (productDetails?.estimatedPrice ||
                                                            0) *
                                                        product.quantity
                                                    ).toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                        <TabsContent value="payments">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">
                                        Selected Payments
                                    </h3>
                                    <AddPaymentDialog
                                        type={type}
                                        accounts={accounts}
                                        onAddPayment={(amount, accountId) => {
                                            setSelectedPayments([
                                                ...selectedPayments,
                                                { amount, accountId },
                                            ]);
                                        }}
                                    />
                                </div>
                                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                    {selectedPayments.map((payment, index) => {
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
                                                        Rs
                                                        {payment.amount.toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removePayment(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                        <TabsContent value="entity">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Select Entity
                                </h3>
                                <SelectEntityDialog
                                    entities={entities}
                                    onSelectEntity={(entityId) =>
                                        setSelectedEntity(
                                            entities.find(
                                                (e) => e.id === entityId
                                            )
                                        )
                                    }
                                />
                                {selectedEntity && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <h4 className="font-medium mb-2">
                                                Selected Entity:
                                            </h4>
                                            <p>{selectedEntity.name}</p>
                                            {selectedEntity.description && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {selectedEntity.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center">
                            <RadioGroup
                                defaultValue={type}
                                onValueChange={(value) =>
                                    setType(value as "BUY" | "SELL")
                                }
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="BUY" id="buy" />
                                    <Label htmlFor="buy">Buy</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="SELL" id="sell" />
                                    <Label htmlFor="sell">Sell</Label>
                                </div>
                            </RadioGroup>
                            <div className="text-lg font-semibold">
                                Total: Rs {totalProductsAmount.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Total Products:</span>
                            <span>Rs {totalProductsAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Total Payments:</span>
                            <span>Rs {totalPaymentsAmount.toFixed(2)}</span>
                        </div>
                        {totalProductsAmount !== totalPaymentsAmount && (
                            <div className="text-sm text-red-500 font-medium">
                                Warning: Total products amount does not match
                                total payments amount.
                            </div>
                        )}
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                        Create Order
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
