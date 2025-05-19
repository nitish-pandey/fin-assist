"use client";

import { useEffect, useState } from "react";
import { Calculator, CreditCard, DollarSign, Tag, Plus, Trash2 } from "lucide-react";
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
    charge: number;
    setDiscount: (value: number) => void;
    setCharge: (value: number) => void;
}

export default function CalculationSelector({
    subTotal,
    discount,
    charge,
    setDiscount,
    setCharge,
}: CalculationSelectorProps) {
    const [discountInput, setDiscountInput] = useState(discount.toString());
    const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([
        { id: "1", label: "TAX", amount: charge },
    ]);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    // Format number as currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Handle discount input change with validation
    const handleDiscountChange = (value: string) => {
        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
            setDiscountInput(value);
            const numValue = value === "" ? 0 : Number.parseFloat(value);
            if (!isNaN(numValue)) {
                setDiscount(numValue);
            }
        }
    };

    // Handle charge amount change
    const handleChargeAmountChange = (id: string, value: string) => {
        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
            const numValue = value === "" ? 0 : Number.parseFloat(value);

            if (!isNaN(numValue)) {
                const updatedCharges = additionalCharges.map((charge) =>
                    charge.id === id ? { ...charge, amount: numValue } : charge
                );

                setAdditionalCharges(updatedCharges);
                updateTotalCharge(updatedCharges);
            }
        }
    };

    // Handle charge label change
    const handleChargeLabelChange = (id: string, label: string) => {
        const updatedCharges = additionalCharges.map((charge) =>
            charge.id === id ? { ...charge, label } : charge
        );
        setAdditionalCharges(updatedCharges);
    };

    // Add a new charge
    const addCharge = () => {
        const newCharge = {
            id: Date.now().toString(),
            label: "New Charge",
            amount: 0,
        };
        const updatedCharges = [...additionalCharges, newCharge];
        setAdditionalCharges(updatedCharges);
        updateTotalCharge(updatedCharges);
    };

    // Remove a charge
    const removeCharge = (id: string) => {
        const updatedCharges = additionalCharges.filter((charge) => charge.id !== id);
        setAdditionalCharges(updatedCharges);
        updateTotalCharge(updatedCharges);
    };

    // Update the total charge
    const updateTotalCharge = (charges: AdditionalCharge[]) => {
        const total = charges.reduce((sum, charge) => sum + charge.amount, 0);
        setCharge(total);
    };

    // Calculate total whenever inputs change
    useEffect(() => {
        const total = subTotal - discount + charge;
        setCalculatedTotal(total);
    }, [subTotal, discount, charge]);

    // Calculate discount percentage
    const discountPercentage = subTotal > 0 ? (discount / subTotal) * 100 : 0;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Summary Card */}
                <Card className="col-span-1 overflow-hidden md:col-span-2">
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
                                <span className="font-semibold">{formatCurrency(subTotal)}</span>
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
                                            {formatCurrency(discount)}
                                        </span>
                                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-600">
                                            {discountPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            $
                                        </span>
                                        <Input
                                            type="text"
                                            className="h-8 pl-7"
                                            value={discountInput}
                                            min={0}
                                            onChange={(e) => handleDiscountChange(e.target.value)}
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
                                    <span className="font-medium">{formatCurrency(charge)}</span>
                                </div>

                                {/* List of charges */}
                                <div className="space-y-2">
                                    {additionalCharges.map((charge) => (
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
                                                    $
                                                </span>
                                                <Input
                                                    type="text"
                                                    className="h-8 pl-7 text-sm"
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
                                                    disabled={additionalCharges.length === 1}
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
                                    onClick={addCharge}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Charge
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Card */}
                <Card className="col-span-1 overflow-hidden">
                    <div className="border-b p-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <DollarSign className="h-5 w-5" />
                            Total
                        </h2>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="mb-4 text-center">
                            <span className="text-3xl font-bold">
                                {formatCurrency(calculatedTotal)}
                            </span>
                        </div>

                        <Separator className="mb-3" />

                        <div className="w-full space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subTotal)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500">Discount</span>
                                    <span className="font-medium text-rose-500">
                                        -{formatCurrency(discount)}
                                    </span>
                                </div>
                            )}

                            {additionalCharges.map(
                                (charge) =>
                                    charge.amount > 0 && (
                                        <div
                                            key={charge.id}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-slate-500">{charge.label}</span>
                                            <span className="font-medium">
                                                {formatCurrency(charge.amount)}
                                            </span>
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
