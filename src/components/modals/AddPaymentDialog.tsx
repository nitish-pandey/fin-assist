"use client";

import type React from "react";
import { useState, useMemo } from "react";
import type { Account } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddPaymentDialogProps {
    accounts: Account[];
    type: "BUY" | "SELL";
    onAddPayment: (amount: number, accountId: string, details: object) => void;
    remainingAmount?: number;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
    accounts,
    type,
    onAddPayment,
    remainingAmount,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState<number | "">("");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [error, setError] = useState<string | null>(null);

    const selectedAccountDetails = useMemo(
        () => accounts.find((account) => account.id === selectedAccount),
        [accounts, selectedAccount]
    );

    const handleAddPayment = () => {
        if (!amount || !selectedAccount) {
            setError("Please enter an amount and select an account.");
            return;
        }

        if (type === "BUY" && selectedAccountDetails && selectedAccountDetails.balance < amount) {
            setError("Insufficient balance in the selected account.");
            return;
        }

        onAddPayment(Number(amount), selectedAccount, {});
        handleClose();
    };

    const handleClose = () => {
        setIsOpen(false);
        setAmount("");
        setSelectedAccount("");
        setError(null);
    };

    return (
        <>
            <Button type="button" onClick={() => setIsOpen(true)}>
                Add Payment
            </Button>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[500px] p-6 rounded-lg shadow-lg">
                    <DialogHeader className="text-lg font-semibold mb-4">Add Payment</DialogHeader>
                    {remainingAmount !== undefined && (
                        <div className="text-sm text-gray-700 mb-4 font-medium">
                            Remaining Amount:{" "}
                            <span className="text-primary">${remainingAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value ? Number(e.target.value) : "");
                                    setError(null);
                                }}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account">Account</Label>
                            <Select
                                value={selectedAccount}
                                onValueChange={(value) => {
                                    setSelectedAccount(value);
                                    setError(null);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name} (Balance: ${account.balance.toFixed(2)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm font-medium py-2">{error}</div>}
                    <DialogFooter className="mt-6 flex justify-end">
                        <Button variant="outline" onClick={handleClose} className="mr-2">
                            Cancel
                        </Button>
                        <Button onClick={handleAddPayment} type="button">
                            Add Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddPaymentDialog;
