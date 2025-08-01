"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { useOrg } from "@/providers/org-provider";

interface AdditionalCharge {
    id: string;
    label: string;
    amount: number;
    type: "fixed" | "percentage";
    percentage: number;
    isVat?: boolean; // Optional property to indicate if it's a VAT charge
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
        isVat?: boolean; // Optional property to indicate if it's a VAT charge
    }[];
    setDiscount: (value: number) => void;
    setCharge: (
        charges: {
            id: string;
            amount: number;
            label: string;
            type: "fixed" | "percentage";
            percentage: number;
            isVat?: boolean;
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
    const { organization } = useOrg();
    const vatStatus = organization?.vatStatus || "conditional";
    const prevSubTotalRef = useRef(subTotal);

    const actualDiscount = useMemo(() => {
        return discount; // Always use the discount amount since it's kept in sync
    }, [discount]);

    // Handle discount amount change
    const handleDiscountAmountChange = (value: number) => {
        setDiscount(value);
        // If we're in fixed mode, update percentage to reflect the new amount
        if (discountType === "fixed" && subTotal > 0) {
            setDiscountPercentage((value / subTotal) * 100);
        }
    };

    // Handle discount percentage change
    const handleDiscountPercentageChange = (value: number) => {
        setDiscountPercentage(value);
        // If we're in percentage mode, update the discount amount
        if (discountType === "percentage") {
            setDiscount((subTotal * value) / 100);
        }
    };

    // Sync values when subtotal changes
    useEffect(() => {
        // Only update if subtotal actually changed
        if (prevSubTotalRef.current !== subTotal && subTotal > 0) {
            if (discountType === "fixed" && discount > 0) {
                // When in fixed mode and subtotal changes, update percentage
                setDiscountPercentage((discount / subTotal) * 100);
            } else if (
                discountType === "percentage" &&
                discountPercentage > 0
            ) {
                // When in percentage mode and subtotal changes, update amount
                setDiscount((subTotal * discountPercentage) / 100);
            }
            // Update the ref with current subtotal
            prevSubTotalRef.current = subTotal;
        }
    }, [subTotal, discount, discountPercentage, discountType, setDiscount]);

    // Sync charge amounts when subtotal changes
    useEffect(() => {
        if (
            prevSubTotalRef.current !== subTotal &&
            subTotal > 0 &&
            charges.length > 0
        ) {
            const updatedCharges = charges.map((charge) => {
                if (charge.type === "percentage" && charge.percentage > 0) {
                    // Recalculate amount for percentage-based charges
                    return {
                        ...charge,
                        amount: (subTotal * charge.percentage) / 100,
                    };
                } else if (charge.type === "fixed" && charge.amount > 0) {
                    // Update percentage for fixed charges for display purposes
                    return {
                        ...charge,
                        percentage: (charge.amount / subTotal) * 100,
                    };
                }
                return charge;
            });

            // Only update if there are actual changes
            const hasChanges = updatedCharges.some(
                (charge, index) =>
                    charge.amount !== charges[index].amount ||
                    charge.percentage !== charges[index].percentage
            );

            if (hasChanges) {
                setCharge(updatedCharges);
            }
        }
    }, [subTotal, charges, setCharge]);

    // Auto-add VAT when vatStatus is "always" and no VAT charge exists
    useEffect(() => {
        if (vatStatus === "always" && !charges.some((c) => c.isVat)) {
            const vatCharge: AdditionalCharge = {
                id: Date.now().toString(),
                label: "VAT",
                percentage: 13, // Default 13% VAT
                type: "percentage",
                amount: (subTotal * 13) / 100, // Calculate VAT based on subtotal
                isVat: true,
            };
            setCharge([...charges, vatCharge]);
        }
    }, [vatStatus, charges, subTotal, setCharge]);

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
            isVat: true,
        };
        setCharge([...charges, vatCharge]);
    };

    const handleChargeLabelChange = (id: string, label: string) => {
        const updatedCharges = charges.map((charge) =>
            charge.id === id ? { ...charge, label } : charge
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

    const handleChargeAmountChange = (id: string, amount: string) => {
        const parsedAmount = parseFloat(amount);
        const updatedCharges = charges.map((charge) => {
            if (charge.id === id) {
                const newAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
                // If it's a fixed charge, also update the percentage for display
                const newPercentage =
                    charge.type === "fixed" && subTotal > 0
                        ? (newAmount / subTotal) * 100
                        : charge.percentage;
                return {
                    ...charge,
                    amount: newAmount,
                    percentage: newPercentage,
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
        const updatedCharges = charges.map((charge) => {
            if (charge.id === id) {
                if (type === "percentage") {
                    // Switching to percentage: calculate percentage from current amount
                    const newPercentage =
                        subTotal > 0 ? (charge.amount / subTotal) * 100 : 0;
                    return {
                        ...charge,
                        type,
                        percentage: newPercentage,
                        amount: (subTotal * newPercentage) / 100, // Recalculate amount
                    };
                } else {
                    // Switching to fixed: keep current amount, update percentage for display
                    const newPercentage =
                        subTotal > 0 ? (charge.amount / subTotal) * 100 : 0;
                    return {
                        ...charge,
                        type,
                        percentage: newPercentage,
                    };
                }
            }
            return charge;
        });
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
                            {/* Discount */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                        <Tag className="h-3.5 w-3.5 text-rose-500" />
                                        Discount
                                    </Label>
                                    <div className="flex items-center gap-2"></div>
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
                                                onClick={() => {
                                                    setDiscountType("fixed");
                                                    // When switching to fixed, sync percentage with current amount
                                                    if (subTotal > 0) {
                                                        setDiscountPercentage(
                                                            (discount /
                                                                subTotal) *
                                                                100
                                                        );
                                                    }
                                                }}
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
                                                onClick={() => {
                                                    setDiscountType(
                                                        "percentage"
                                                    );
                                                    // When switching to percentage, sync amount with current percentage
                                                    setDiscount(
                                                        (subTotal *
                                                            discountPercentage) /
                                                            100
                                                    );
                                                }}
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
                                                        handleDiscountPercentageChange(
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
                                                        handleDiscountAmountChange(
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
                                    <span className="font-medium"></span>
                                </div>

                                <div className="space-y-3">
                                    {charges.map((charge) => (
                                        <div
                                            key={charge.id}
                                            className="space-y-3 rounded-lg border p-4 bg-white shadow-sm"
                                        >
                                            {/* Header with Label and Type Toggle */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <Label className="text-xs text-slate-600 mb-2 block font-medium">
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
                                                        disabled={charge.isVat}
                                                        placeholder="Enter charge name"
                                                        className="h-9 text-sm"
                                                    />
                                                </div>

                                                {/* Type Toggle */}
                                                {!charge.isVat && (
                                                    <div className="flex-shrink-0">
                                                        <Label className="text-xs text-slate-600 mb-2 block font-medium">
                                                            Type
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
                                                                className="h-9 px-3 text-xs font-medium"
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
                                                                className="h-9 px-3 text-xs font-medium"
                                                                onClick={() =>
                                                                    handleChargeTypeChange(
                                                                        charge.id,
                                                                        "percentage"
                                                                    )
                                                                }
                                                            >
                                                                <Percent className="h-3 w-3 mr-1" />
                                                                Percentage
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Value Inputs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Percentage Input */}
                                                {charge.type ===
                                                    "percentage" && (
                                                    <div>
                                                        <Label className="text-xs text-slate-600 mb-2 block font-medium">
                                                            Percentage (%)
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                className="h-9 pr-8 text-sm"
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
                                                                    charge.isVat
                                                                }
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amount Input */}
                                                {charge.type === "fixed" && (
                                                    <div>
                                                        <Label className="text-xs text-slate-600 mb-2 block font-medium">
                                                            Amount (Rs)
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                className="h-9 pl-8 text-sm"
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
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                                                                Rs
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Calculated Value Display */}
                                                <div>
                                                    <Label className="text-xs text-slate-600 mb-2 block font-medium">
                                                        {charge.type ===
                                                        "percentage"
                                                            ? "Calculated Amount"
                                                            : "Calculated Percentage"}
                                                    </Label>
                                                    <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-md flex items-center text-sm text-slate-600">
                                                        {charge.type ===
                                                        "percentage"
                                                            ? `Rs ${(
                                                                  (subTotal *
                                                                      charge.percentage) /
                                                                  100
                                                              ).toFixed(2)}`
                                                            : `${
                                                                  subTotal > 0
                                                                      ? (
                                                                            (charge.amount /
                                                                                subTotal) *
                                                                            100
                                                                        ).toFixed(
                                                                            2
                                                                        )
                                                                      : "0"
                                                              }%`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            {vatStatus === "always" &&
                                            charge.isVat ? null : (
                                                <div className="flex justify-end pt-2 border-t border-slate-100">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                                                        onClick={() =>
                                                            removeCharge(
                                                                charge.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="h-9 text-sm flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium"
                                        onClick={handleAddNewCharge}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Charge
                                    </Button>
                                    {charges.some((c) => c.isVat) ||
                                    vatStatus === "never" ? null : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            className="h-9 text-sm flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors font-medium"
                                            onClick={handleAddVAT}
                                        >
                                            <Receipt className="h-4 w-4 mr-2" />
                                            Add VAT (13%)
                                        </Button>
                                    )}
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
