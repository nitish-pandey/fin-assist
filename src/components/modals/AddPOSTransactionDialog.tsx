import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Account } from "@/data/types";
import { api } from "@/utils/api";
import { toast } from "@/hooks/use-toast";

interface AddPOSTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
    posRegisterId: string;
    accounts: Account[];
    onTransactionAdded: () => void;
}

type TransactionType = "IN" | "OUT";

export default function AddPOSTransactionDialog({
    open,
    onOpenChange,
    orgId,
    posRegisterId,
    accounts,
    onTransactionAdded,
}: AddPOSTransactionDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>("IN");
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState("");

    const resetForm = () => {
        setTransactionType("IN");
        setAccountId("");
        setAmount(0);
        setDescription("");
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!accountId) {
            toast({
                title: "Error",
                description: "Please select an account",
                variant: "destructive",
            });
            return;
        }

        if (amount <= 0) {
            toast({
                title: "Error",
                description: "Amount must be greater than 0",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const transactionData = {
                amount,
                description:
                    description || `POS ${transactionType === "IN" ? "Cash In" : "Cash Out"}`,
                details: {},
                type: transactionType === "IN" ? "SELL" : "BUY", // SELL for money in, BUY for money out
                posRegisterId,
            };

            await api.post(`/orgs/${orgId}/accounts/${accountId}/transactions`, transactionData);

            toast({
                title: "Success",
                description: `Transaction ${
                    transactionType === "IN" ? "added" : "recorded"
                } successfully`,
            });

            onTransactionAdded();
            handleClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || "Failed to add transaction";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAccount = accounts.find((a) => a.id === accountId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Transaction Type Toggle */}
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTransactionType("IN")}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    transactionType === "IN"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Plus className="h-5 w-5" />
                                <span className="font-medium">Money In</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransactionType("OUT")}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    transactionType === "OUT"
                                        ? "border-red-500 bg-red-50 text-red-700"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Minus className="h-5 w-5" />
                                <span className="font-medium">Money Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Account Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="account">Account</Label>
                        <select
                            id="account"
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                        >
                            <option value="">Select account...</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.type}) - Rs{" "}
                                    {account.balance.toFixed(2)}
                                </option>
                            ))}
                        </select>
                        {selectedAccount && transactionType === "OUT" && (
                            <p className="text-xs text-muted-foreground">
                                Available: Rs {selectedAccount.balance.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                Rs
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                value={amount || ""}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="pl-10"
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`Enter reason for ${
                                transactionType === "IN" ? "cash in" : "expense/cash out"
                            }...`}
                            rows={2}
                        />
                    </div>

                    {/* Summary */}
                    {amount > 0 && accountId && (
                        <div
                            className={`p-3 rounded-lg text-sm ${
                                transactionType === "IN"
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                            }`}
                        >
                            <p
                                className={
                                    transactionType === "IN" ? "text-green-700" : "text-red-700"
                                }
                            >
                                {transactionType === "IN" ? "+" : "-"} Rs {amount.toFixed(2)} will
                                be {transactionType === "IN" ? "added to" : "deducted from"}{" "}
                                <span className="font-medium">{selectedAccount?.name}</span>
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !accountId || amount <= 0}
                        className={
                            transactionType === "IN"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                        }
                    >
                        {isSubmitting
                            ? "Processing..."
                            : transactionType === "IN"
                            ? "Add Money"
                            : "Record Expense"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
