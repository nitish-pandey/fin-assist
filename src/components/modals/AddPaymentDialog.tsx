"use client";

import { useState, useMemo } from "react";
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
    onAddPayment: (amount: number, accountId: string, details: object) => void;
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

    const selectedAccount = useMemo(
        () => accounts.find((a) => a.id === accountId),
        [accountId, accounts]
    );

    const isChequeAccount = selectedAccount?.type === "CHEQUE";

    const resetState = () => {
        setIsOpen(false);
        setAmount("");
        setAccountId("");
        setDetails({});
        setError(null);
    };

    const validateAndSubmit = () => {
        if (!amount || !accountId) {
            setError("Please enter a valid amount and select an account.");
            return;
        }

        if (type === "BUY" && (selectedAccount?.balance || 0) < amount) {
            setError("Insufficient balance in selected account.");
            return;
        }

        onAddPayment(Number(amount), accountId, details);
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
                        <p className="text-sm text-muted-foreground font-medium">
                            Remaining:{" "}
                            <span className="text-primary">Rs {remainingAmount.toFixed(2)}</span>
                        </p>
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
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name} (Rs {acc.balance.toFixed(2)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

                    <DialogFooter className="pt-4 flex justify-end">
                        <Button variant="outline" onClick={resetState} type="button">
                            Cancel
                        </Button>
                        <Button onClick={validateAndSubmit} type="button">
                            Add Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
