"use client";

import { useState, useMemo, useEffect } from "react";
import type { Account, TransactionDetails } from "@/data/types";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddPaymentDialogProps {
    accounts: Account[];
    type: "BUY" | "SELL" | "MISC";
    onAddPayment: (amount: number, accountId: string, details: object, createdAt?: string) => void;
    remainingAmount?: number;
}

export default function AddPaymentDialog({
    accounts,
    type,
    onAddPayment,
    remainingAmount,
}: AddPaymentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState<number | "">("");
    const [accountId, setAccountId] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<TransactionDetails>({});
    const [transactionDate, setTransactionDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [currentTime] = useState<string>(new Date().toISOString());

    // Find the default cash account
    const cashAccount = useMemo(
        () => accounts.find((acc) => acc.type === "CASH_COUNTER"),
        [accounts]
    );

    const selectedAccount = useMemo(
        () => accounts.find((a) => a.id === accountId),
        [accountId, accounts]
    );

    const isChequeAccount = selectedAccount?.type === "CHEQUE";

    // Set defaults when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Default to cash account if available
            if (cashAccount) {
                setAccountId(cashAccount.id);
            }
            // Default to remaining amount if available
            if (remainingAmount !== undefined && remainingAmount > 0) {
                setAmount(remainingAmount);
            }
        }
    }, [isOpen, cashAccount, remainingAmount]);

    const resetState = () => {
        setIsOpen(false);
        setAmount("");
        setAccountId("");
        setDetails({});
        setError(null);
        setTransactionDate(new Date().toISOString().split("T")[0]);
    };

    const addAllRemaining = () => {
        if (remainingAmount !== undefined && remainingAmount > 0) {
            setAmount(remainingAmount);
            if (cashAccount) {
                setAccountId(cashAccount.id);
            }
            setError(null);
        }
    };

    const validateAndSubmit = () => {
        if (!amount || !accountId) {
            setError("Please enter a valid amount and select an account.");
            return;
        }

        if (type === "BUY" && selectedAccount) {
            const availableBalance = selectedAccount.balance;
            if (availableBalance < amount) {
                setError(
                    `Insufficient balance. Available: Rs ${availableBalance.toFixed(
                        2
                    )}, Required: Rs ${amount.toFixed(2)}`
                );
                return;
            }
        }

        // Convert date to ISO datetime format, preserving current time
        const createdAtISO = transactionDate
            ? (() => {
                  const selectedDate = new Date(transactionDate);
                  const currentDateTime = new Date(currentTime);
                  selectedDate.setHours(currentDateTime.getHours());
                  selectedDate.setMinutes(currentDateTime.getMinutes());
                  selectedDate.setSeconds(currentDateTime.getSeconds());
                  selectedDate.setMilliseconds(currentDateTime.getMilliseconds());
                  return selectedDate.toISOString();
              })()
            : new Date().toISOString();

        onAddPayment(Number(amount), accountId, details, createdAtISO);
        resetState();
    };

    const handleChequeDetailChange = (key: keyof TransactionDetails, value: string) => {
        setDetails({ ...details, [key]: value });
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} type="button">
                Add Payment
            </Button>

            <Dialog open={isOpen} onOpenChange={resetState}>
                <DialogContent className="sm:max-w-md p-6 space-y-6">
                    <DialogHeader className="text-lg font-semibold">Add Payment</DialogHeader>

                    {remainingAmount !== undefined && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                            <p className="text-sm text-muted-foreground font-medium">
                                Remaining:{" "}
                                <span className="text-primary font-semibold">
                                    Rs {remainingAmount.toFixed(2)}
                                </span>
                            </p>
                            {remainingAmount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addAllRemaining}
                                    type="button"
                                    className="w-full"
                                >
                                    Add All Remaining (Rs {remainingAmount.toFixed(2)})
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Amount Input */}
                        <div className="space-y-1">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setAmount(value ? Number(value) : "");
                                    setError(null);
                                }}
                            />
                        </div>

                        {/* Transaction Date */}
                        <div className="space-y-1">
                            <Label htmlFor="transactionDate">Transaction Date (Optional)</Label>
                            <Input
                                id="transactionDate"
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                            />
                        </div>

                        {/* Account Selection */}
                        <div className="space-y-1">
                            <Label htmlFor="account">Account</Label>
                            <Select
                                value={accountId}
                                onValueChange={(val) => {
                                    setAccountId(val);
                                    setError(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((acc) => {
                                        const hasInsufficientBalance =
                                            type === "BUY" &&
                                            typeof amount === "number" &&
                                            amount > acc.balance;
                                        return (
                                            <SelectItem
                                                key={acc.id}
                                                value={acc.id}
                                                disabled={hasInsufficientBalance}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="flex items-center gap-2">
                                                        {acc.name}
                                                        {acc.type === "CASH_COUNTER" && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                                Cash
                                                            </span>
                                                        )}
                                                        {acc.type === "CHEQUE" && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                                Cheque
                                                            </span>
                                                        )}
                                                        {hasInsufficientBalance && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                                                Insufficient
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`text-sm ml-2 ${
                                                            hasInsufficientBalance
                                                                ? "text-red-500"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        Rs {acc.balance.toFixed(2)}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {selectedAccount && type === "BUY" && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Available Balance:
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                typeof amount === "number" &&
                                                amount > selectedAccount.balance
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            Rs {selectedAccount.balance.toFixed(2)}
                                        </span>
                                    </div>
                                    {typeof amount === "number" &&
                                        amount > selectedAccount.balance && (
                                            <div className="mt-1 text-xs text-red-600">
                                                ⚠️ Amount exceeds available balance by Rs{" "}
                                                {(amount - selectedAccount.balance).toFixed(2)}
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Cheque Fields */}
                        {isChequeAccount && (
                            <div className="space-y-4 pt-2 border-t">
                                <div className="space-y-1">
                                    <Label htmlFor="chequeIssuer">Cheque Issuer</Label>
                                    <Input
                                        id="chequeIssuer"
                                        value={details.chequeIssuer || ""}
                                        onChange={(e) =>
                                            handleChequeDetailChange("chequeIssuer", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="chequeIssuerBank">Cheque Issuer Bank</Label>
                                    <Input
                                        id="chequeIssuerBank"
                                        value={details.chequeIssuerBank || ""}
                                        onChange={(e) =>
                                            handleChequeDetailChange(
                                                "chequeIssuerBank",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="chequeNumber">Cheque Number</Label>
                                    <Input
                                        id="chequeNumber"
                                        value={details.chequeNumber || ""}
                                        onChange={(e) =>
                                            handleChequeDetailChange("chequeNumber", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="chequeDate">Cheque Date</Label>
                                    <Input
                                        id="chequeDate"
                                        type="date"
                                        value={details.chequeDate || ""}
                                        onChange={(e) =>
                                            handleChequeDetailChange("chequeDate", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>

                    <DialogFooter className="pt-4 flex justify-between">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={resetState} type="button">
                                Cancel
                            </Button>
                            <Button onClick={validateAndSubmit} type="button">
                                Add Payment
                            </Button>
                        </div>
                        {remainingAmount !== undefined && remainingAmount > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    addAllRemaining();
                                    setTimeout(() => validateAndSubmit(), 100);
                                }}
                                type="button"
                                className="ml-auto"
                            >
                                Quick Add All
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
