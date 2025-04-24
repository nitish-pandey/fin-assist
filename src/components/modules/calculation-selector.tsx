"use client";

import { useEffect, useState } from "react";
import { Calculator, CreditCard, DollarSign, Percent, Receipt, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CalculationSelectorProps {
    subTotal: number;
    discount: number;
    tax: number;
    charge: number;
    setDiscount: (value: number) => void;
    setCharge: (value: number) => void;
}

export default function CalculationSelector({
    subTotal,
    discount,
    tax,
    charge,
    setDiscount,
    setCharge,
}: CalculationSelectorProps) {
    const [discountInput, setDiscountInput] = useState(discount.toString());
    const [chargeInput, setChargeInput] = useState(charge.toString());
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

    // Handle input changes with validation
    const handleInputChange = (
        value: string,
        setter: (value: string) => void,
        valueSetter: (value: number) => void
    ) => {
        // Allow empty string or valid numbers
        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
            setter(value);
            // Convert to number for the state
            const numValue = value === "" ? 0 : Number.parseFloat(value);
            if (!isNaN(numValue)) {
                valueSetter(numValue);
            }
        }
    };

    // Calculate total whenever inputs change
    useEffect(() => {
        const total = subTotal - discount + tax + charge;
        setCalculatedTotal(total);
    }, [subTotal, discount, tax, charge]);

    // Calculate discount percentage
    const discountPercentage = subTotal > 0 ? (discount / subTotal) * 100 : 0;

    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Summary Card */}
                <Card className="col-span-1 overflow-hidden md:col-span-2">
                    <div className="p-4 border-b">
                        <h2 className="flex items-center gap-2 text-2xl font-bold">
                            <Calculator className="h-6 w-6" />
                            Calculation Summary
                        </h2>
                        <p className="mt-1 text-gray-500">Transaction overview and adjustments</p>
                    </div>

                    <CardContent className="p-6">
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                            <Receipt className="h-4 w-4" />
                                            Subtotal
                                        </Label>
                                        <span className="text-xl font-semibold">
                                            {formatCurrency(subTotal)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label className="flex items-center gap-1 text-sm font-medium text-slate-500">
                                            10 <Percent className="h-4 w-4" />
                                            Tax (Fixed)
                                        </Label>
                                        <span className="text-lg font-medium">
                                            {formatCurrency(tax)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                            <Tag className="h-4 w-4 text-rose-500" />
                                            Discount
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-medium text-rose-500">
                                                {formatCurrency(discount)}
                                            </span>
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                                                {discountPercentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                $
                                            </span>
                                            <Input
                                                type="text"
                                                className="pl-7"
                                                value={discountInput}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.value,
                                                        setDiscountInput,
                                                        setDiscount
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                            Additional Charge
                                        </Label>
                                        <span className="text-lg font-medium">
                                            {formatCurrency(charge)}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            $
                                        </span>
                                        <Input
                                            type="text"
                                            className="pl-7"
                                            value={chargeInput}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    e.target.value,
                                                    setChargeInput,
                                                    setCharge
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Card */}
                <Card className="col-span-1 overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="flex items-center gap-2 text-2xl font-bold">
                            <DollarSign className="h-6 w-6" />
                            Total Amount
                        </h2>
                        <p className="mt-1 text-gray-500">Final calculation</p>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="mb-6 text-center">
                            <span className="text-4xl font-bold">
                                {formatCurrency(calculatedTotal)}
                            </span>
                        </div>

                        <Separator className="mb-6" />

                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subTotal)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-rose-500">Discount</span>
                                    <span className="font-medium text-rose-500">
                                        -{formatCurrency(discount)}
                                    </span>
                                </div>
                            )}

                            {tax > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Tax</span>
                                    <span className="font-medium">{formatCurrency(tax)}</span>
                                </div>
                            )}

                            {charge > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Additional Charge
                                    </span>
                                    <span className="font-medium">{formatCurrency(charge)}</span>
                                </div>
                            )}
                        </div>

                        {/* <div className="mt-6 w-full">
                            <div
                                className={cn(
                                    "flex items-center justify-between rounded-lg p-3",
                                    calculatedTotal > subTotal
                                        ? "bg-rose-50 text-rose-700"
                                        : "bg-emerald-50 text-emerald-700"
                                )}
                            >
                                <span className="font-medium">
                                    {calculatedTotal > subTotal
                                        ? "Amount Increased"
                                        : "Amount Reduced"}
                                </span>
                                <span className="font-bold">
                                    {formatCurrency(Math.abs(calculatedTotal - subTotal))}
                                </span>
                            </div>
                        </div> */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
