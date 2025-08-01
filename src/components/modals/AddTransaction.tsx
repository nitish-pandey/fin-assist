"use client";

import type React from "react";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Account, TransactionDetails } from "@/data/types";

interface AddTransactionProps {
    account: Account | null;
    onAddTransaction: (
        amount: number,
        description: string,
        type: "BUY" | "SELL" | "MISC",
        details: object
    ) => Promise<void>;
}

export function AddTransactionDialog({
    account,
    onAddTransaction,
}: AddTransactionProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"BUY" | "SELL" | "MISC">("BUY");
    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<TransactionDetails>({});

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const numericAmount = Number.parseFloat(amount);

        if (isNaN(numericAmount)) {
            toast({
                title: "Error",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        // Prevent credit transactions from exceeding account balance
        if (type === "BUY" && account && numericAmount > account.balance) {
            toast({
                title: "Error",
                description: `Credit amount cannot exceed account balance of ${formatCurrency(
                    account.balance,
                    "USD"
                )}`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            await onAddTransaction(
                numericAmount,
                description,
                type,
                details || {}
            );
            toast({
                title: "Success",
                description: "Transaction added successfully",
            });
            setOpen(false);
            setAmount("");
            setDescription("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add transaction",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(value);
    };

    if (!account) {
        return null; // or handle the case when account is null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="py-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Add a new transaction to your account.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Account
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {account.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Type
                                    </span>
                                    <span className="text-sm">
                                        {account.type}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Current Balance
                                    </span>
                                    <span
                                        className={cn(
                                            "text-sm font-semibold",
                                            account.balance > 0
                                                ? "text-green-600"
                                                : account.balance < 0
                                                ? "text-red-600"
                                                : ""
                                        )}
                                    >
                                        {formatCurrency(account.balance, "USD")}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter transaction details"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="type">Transaction Type</Label>
                                <div className="flex items-center space-x-2">
                                    <Label
                                        htmlFor="debit"
                                        className={cn(
                                            "cursor-pointer rounded-md px-3 py-1 text-sm",
                                            type === "SELL"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                        onClick={() => setType("SELL")}
                                    >
                                        Debit
                                    </Label>
                                    <Label
                                        htmlFor="credit"
                                        className={cn(
                                            "cursor-pointer rounded-md px-3 py-1 text-sm",
                                            type === "BUY"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                        onClick={() => setType("BUY")}
                                    >
                                        Credit
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {account.type === "CHEQUE" && (
                        <>
                            <div className="grid gap-2 py-4">
                                <Label htmlFor="details">Cheque Issuer</Label>
                                <Input
                                    id="chequeIssuer"
                                    name="chequeIssuer"
                                    placeholder="Enter cheque issuer name"
                                    value={details?.chequeIssuer || ""}
                                    onChange={(e) =>
                                        setDetails({
                                            ...details,
                                            chequeIssuer: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2 py-4">
                                <Label htmlFor="details">
                                    Cheque Issuer Bank
                                </Label>
                                <Input
                                    id="chequeIssuerBank"
                                    name="chequeIssuerBank"
                                    placeholder="Enter cheque issuer bank name"
                                    value={details?.chequeIssuerBank || ""}
                                    onChange={(e) =>
                                        setDetails({
                                            ...details,
                                            chequeIssuerBank: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2 py-4">
                                <Label htmlFor="details">Cheque Number</Label>
                                <Input
                                    id="chequeNumber"
                                    name="chequeNumber"
                                    placeholder="Enter cheque number"
                                    value={details?.chequeNumber || ""}
                                    onChange={(e) =>
                                        setDetails({
                                            ...details,
                                            chequeNumber: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2 py-4">
                                <Label htmlFor="details">Cheque Date</Label>
                                <Input
                                    id="chequeDate"
                                    name="chequeDate"
                                    type="date"
                                    placeholder="Enter cheque date"
                                    value={details?.chequeDate || ""}
                                    onChange={(e) =>
                                        setDetails({
                                            ...details,
                                            chequeDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Transaction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
