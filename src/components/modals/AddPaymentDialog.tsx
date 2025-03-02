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
    onAddPayment: (amount: number, accountId: string) => void;
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

        onAddPayment(Number(amount), selectedAccount);
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>Add Payment</DialogHeader>
                    {remainingAmount && (
                        <div className="col-span-3 text-sm text-gray-800">
                            Remaining Amount: ${remainingAmount.toFixed(2)}
                        </div>
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value ? Number(e.target.value) : "");
                                    setError(null);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account" className="text-right">
                                Account
                            </Label>
                            <Select
                                value={selectedAccount}
                                onValueChange={(value) => {
                                    setSelectedAccount(value);
                                    setError(null);
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
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

                    <DialogFooter>
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
