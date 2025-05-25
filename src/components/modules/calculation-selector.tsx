"use client";

import { useMemo } from "react";
import { Calculator, CreditCard, Tag, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AdditionalCharge {
    id: string;
    label: string;
    amount: number;
}

interface CalculationSelectorProps {
    subTotal: number;
    discount: number;
    charges: { id: string; amount: number; label: string }[];
    setDiscount: (value: number) => void;
    setCharge: (charges: { id: string; amount: number; label: string }[]) => void;
}

export default function CalculationSelector({
    subTotal,
    discount,
    charges,
    setDiscount,
    setCharge,
}: CalculationSelectorProps) {
    const grandTotal = useMemo(() => {
        const total = subTotal - discount + charges.reduce((sum, c) => sum + c.amount, 0);
        return Math.max(total, 0);
    }, [subTotal, discount, charges]);

    const discountPercentage = subTotal > 0 ? (discount / subTotal) * 100 : 0;

    const handleAddNewCharge = () => {
        const newCharge: AdditionalCharge = {
            id: Date.now().toString(),
            label: "",
            amount: 0,
        };
        setCharge([...charges, newCharge]);
    };

    const handleChargeLabelChange = (id: string, label: string) => {
        const updatedCharges = charges.map((charge) =>
            charge.id === id ? { ...charge, label } : charge
        );
        setCharge(updatedCharges);
    };

    const handleChargeAmountChange = (id: string, amount: string) => {
        const parsedAmount = parseFloat(amount);
        const updatedCharges = charges.map((charge) =>
            charge.id === id
                ? { ...charge, amount: isNaN(parsedAmount) ? 0 : parsedAmount }
                : charge
        );
        setCharge(updatedCharges);
    };

    const removeCharge = (id: string) => {
        const updatedCharges = charges.filter((charge) => charge.id !== id);
        setCharge(updatedCharges);
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Summary Card */}
                <Card className="col-span-1 overflow-hidden md:col-span-2 border-0 shadow-none bg-gray-100">
                    <div className="border-b p-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <Calculator className="h-5 w-5" />
                            Bill Details
                        </h2>
                    </div>

                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-500">
                                    Subtotal
                                </Label>
                                <span className="font-semibold">{subTotal}</span>
                            </div>

                            {/* Discount */}
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                        <Tag className="h-3.5 w-3.5 text-rose-500" />
                                        Discount
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-rose-500">
                                            {discount}
                                        </span>
                                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-600">
                                            {discountPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            Rs
                                        </span>
                                        <Input
                                            type="number"
                                            className="h-8 pl-9"
                                            value={discount}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                setDiscount(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-1" />

                            {/* Additional Charges */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                                        <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                                        Additional Charges
                                    </Label>
                                    <span className="font-medium">{grandTotal}</span>
                                </div>

                                <div className="space-y-2">
                                    {charges.map((charge) => (
                                        <div
                                            key={charge.id}
                                            className="grid grid-cols-12 gap-2 items-center"
                                        >
                                            <div className="col-span-5">
                                                <Input
                                                    type="text"
                                                    value={charge.label}
                                                    onChange={(e) =>
                                                        handleChargeLabelChange(
                                                            charge.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Charge label"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                    Rs
                                                </span>
                                                <Input
                                                    type="text"
                                                    className="h-8 pl-9 text-sm"
                                                    value={charge.amount.toString()}
                                                    onChange={(e) =>
                                                        handleChargeAmountChange(
                                                            charge.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7"
                                                    onClick={() => removeCharge(charge.id)}
                                                    disabled={charges.length <= 1}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    className="mt-2 h-7 text-xs"
                                    onClick={handleAddNewCharge}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Charge
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Card */}
                <Card className="col-span-1 overflow-hidden border-0 shadow-none bg-gray-100">
                    <div className="border-b p-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold">Rs Total</h2>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="mb-4 text-center">
                            <span className="text-3xl font-bold">Rs {grandTotal}</span>
                        </div>

                        <Separator className="mb-3" />

                        <div className="w-full space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium">Rs {subTotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500">Discount</span>
                                    <span className="font-medium text-rose-500">
                                        Rs -{discount}
                                    </span>
                                </div>
                            )}

                            {charges.map(
                                (charge) =>
                                    charge.amount > 0 && (
                                        <div
                                            key={charge.id}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-slate-500">{charge.label}</span>
                                            <span className="font-medium">Rs {charge.amount}</span>
                                        </div>
                                    )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
