"use client";

import { useMemo, useState } from "react";
import {
    Calculator,
    CreditCard,
    Tag,
    Plus,
    Trash2,
    Percent,
    Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AdditionalCharge {
    id: string;
    label: string;
    amount: number;
    type: "fixed" | "percentage";
    percentage: number;
}

interface CalculationSelectorProps {
    subTotal: number;
    discount: number;
    charges: {
        id: string;
        amount: number;
        label: string;
        type: "fixed" | "percentage";
        percentage: number;
    }[];
    setDiscount: (value: number) => void;
    setCharge: (
        charges: {
            id: string;
            amount: number;
            label: string;
            type: "fixed" | "percentage";
            percentage: number;
        }[]
    ) => void;
}

export default function CalculationSelector({
    subTotal,
    discount,
    charges,
    setDiscount,
    setCharge,
}: CalculationSelectorProps) {
    const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
        "fixed"
    );
    const [discountPercentage, setDiscountPercentage] = useState(0);

    const actualDiscount = useMemo(() => {
        if (discountType === "percentage") {
            return (subTotal * discountPercentage) / 100;
        }
        return discount;
    }, [discountType, discountPercentage, discount, subTotal]);

    const grandTotal = useMemo(() => {
        const chargesTotal = charges.reduce((sum, c) => {
            if (c.type === "percentage") {
                return sum + (subTotal * c.percentage) / 100;
            }
            return sum + c.amount;
        }, 0);
        const total = subTotal - actualDiscount + chargesTotal;
        return Math.max(total, 0);
    }, [subTotal, actualDiscount, charges]);

    const discountDisplayPercentage =
        subTotal > 0 ? (actualDiscount / subTotal) * 100 : 0;

    const handleAddNewCharge = () => {
        const newCharge: AdditionalCharge = {
            id: Date.now().toString(),
            label: "",
            amount: 0,
            type: "fixed",
            percentage: 0,
        };
        setCharge([...charges, newCharge]);
    };

    const handleAddVAT = () => {
        const vatCharge: AdditionalCharge = {
            id: Date.now().toString(),
            label: "VAT",
            percentage: 13, // Default 13% VAT
            type: "percentage",
            amount: (subTotal * 13) / 100, // Calculate VAT based on subtotal
        };
        setCharge([...charges, vatCharge]);
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

    const handleChargePercentageChange = (id: string, percentage: string) => {
        const parsedPercentage = parseFloat(percentage);
        const updatedCharges = charges.map((charge) => {
            if (charge.id === id) {
                const newPercentage = isNaN(parsedPercentage)
                    ? 0
                    : parsedPercentage;
                const newAmount = (subTotal * newPercentage) / 100;
                return {
                    ...charge,
                    percentage: newPercentage,
                    amount: newAmount,
                };
            }
            return charge;
        });
        setCharge(updatedCharges);
    };

    const handleChargeTypeChange = (
        id: string,
        type: "fixed" | "percentage"
    ) => {
        const updatedCharges = charges.map((charge) =>
            charge.id === id ? { ...charge, type } : charge
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
                                <span className="font-semibold">
                                    {subTotal}
                                </span>
                            </div>

                            {/* Discount */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                        <Tag className="h-3.5 w-3.5 text-rose-500" />
                                        Discount
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-rose-500">
                                            {actualDiscount.toFixed(2)}
                                        </span>
                                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-600">
                                            {discountDisplayPercentage.toFixed(
                                                1
                                            )}
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 rounded-lg border p-3 bg-white">
                                    {/* Discount Type Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs text-slate-600">
                                            Type:
                                        </Label>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant={
                                                    discountType === "fixed"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() =>
                                                    setDiscountType("fixed")
                                                }
                                            >
                                                Fixed (Rs)
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={
                                                    discountType ===
                                                    "percentage"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() =>
                                                    setDiscountType(
                                                        "percentage"
                                                    )
                                                }
                                            >
                                                <Percent className="h-2.5 w-2.5 mr-1" />
                                                Percentage
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Discount Amount and Percentage Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Percentage Input */}
                                        <div>
                                            <Label className="text-xs text-slate-600 mb-1 block">
                                                Percentage (%)
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                    %
                                                </span>
                                                <Input
                                                    type="number"
                                                    className="h-8 pr-6 text-sm"
                                                    value={discountPercentage}
                                                    onChange={(e) => {
                                                        const value =
                                                            parseFloat(
                                                                e.target.value
                                                            );
                                                        setDiscountPercentage(
                                                            isNaN(value)
                                                                ? 0
                                                                : value
                                                        );
                                                    }}
                                                    placeholder="0"
                                                    disabled={
                                                        discountType === "fixed"
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Amount Input */}
                                        <div>
                                            <Label className="text-xs text-slate-600 mb-1 block">
                                                Amount (Rs)
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                    Rs
                                                </span>
                                                <Input
                                                    type="number"
                                                    className="h-8 pl-6 text-sm"
                                                    value={discount}
                                                    onChange={(e) => {
                                                        const value =
                                                            parseFloat(
                                                                e.target.value
                                                            );
                                                        setDiscount(
                                                            isNaN(value)
                                                                ? 0
                                                                : value
                                                        );
                                                    }}
                                                    placeholder="0.00"
                                                    disabled={
                                                        discountType ===
                                                        "percentage"
                                                    }
                                                />
                                            </div>
                                        </div>
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
                                    <span className="font-medium">
                                        {grandTotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {charges.map((charge) => (
                                        <div
                                            key={charge.id}
                                            className="space-y-2 rounded-lg border p-3 bg-white"
                                        >
                                            {/* Label Input */}
                                            <div className="w-full">
                                                <Label className="text-xs text-slate-600 mb-1 block">
                                                    Charge Label
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={charge.label}
                                                    onChange={(e) =>
                                                        handleChargeLabelChange(
                                                            charge.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter charge name"
                                                    className="h-8 text-sm"
                                                />
                                            </div>

                                            {/* Type Toggle */}
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-slate-600">
                                                    Type:
                                                </Label>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            charge.type ===
                                                            "fixed"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() =>
                                                            handleChargeTypeChange(
                                                                charge.id,
                                                                "fixed"
                                                            )
                                                        }
                                                    >
                                                        Fixed (Rs)
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            charge.type ===
                                                            "percentage"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() =>
                                                            handleChargeTypeChange(
                                                                charge.id,
                                                                "percentage"
                                                            )
                                                        }
                                                    >
                                                        <Percent className="h-2.5 w-2.5 mr-1" />
                                                        Percentage
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Amount and Percentage Inputs */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Percentage Input */}
                                                <div>
                                                    <Label className="text-xs text-slate-600 mb-1 block">
                                                        Percentage (%)
                                                    </Label>
                                                    <div className="relative">
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                            %
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="h-8 pr-6 text-sm"
                                                            value={
                                                                charge.percentage
                                                            }
                                                            onChange={(e) =>
                                                                handleChargePercentageChange(
                                                                    charge.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="0"
                                                            disabled={
                                                                charge.type ===
                                                                "fixed"
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* Amount Input */}
                                                <div>
                                                    <Label className="text-xs text-slate-600 mb-1 block">
                                                        Amount (Rs)
                                                    </Label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                            Rs
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="h-8 pl-6 text-sm"
                                                            value={
                                                                charge.amount
                                                            }
                                                            onChange={(e) =>
                                                                handleChargeAmountChange(
                                                                    charge.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="0.00"
                                                            disabled={
                                                                charge.type ===
                                                                "percentage"
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                                    onClick={() =>
                                                        removeCharge(charge.id)
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="h-8 text-sm flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                        onClick={handleAddNewCharge}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Charge
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="h-8 text-sm flex-1 border-green-200 text-green-600 hover:bg-green-50"
                                        onClick={handleAddVAT}
                                    >
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Add VAT (13%)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Card */}
                <Card className="col-span-1 overflow-hidden border-0 shadow-none bg-gray-100">
                    <div className="border-b p-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            Rs Total
                        </h2>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="mb-4 text-center">
                            <span className="text-3xl font-bold">
                                Rs {grandTotal.toFixed(2)}
                            </span>
                        </div>

                        <Separator className="mb-3" />

                        <div className="w-full space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium">
                                    Rs {subTotal.toFixed(2)}
                                </span>
                            </div>
                            {actualDiscount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500">
                                        Discount
                                    </span>
                                    <span className="font-medium text-rose-500">
                                        Rs -{actualDiscount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {charges.map((charge) => {
                                const chargeAmount =
                                    charge.type === "percentage"
                                        ? (subTotal * charge.percentage) / 100
                                        : charge.amount;
                                return (
                                    chargeAmount > 0 && (
                                        <div
                                            key={charge.id}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-slate-500">
                                                {charge.label}
                                                {charge.type === "percentage" &&
                                                    ` (${charge.percentage}%)`}
                                            </span>
                                            <span className="font-medium">
                                                Rs {chargeAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    )
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
