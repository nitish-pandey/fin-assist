"use client";

import { useMemo } from "react";
import {
    Trash2,
    CreditCard,
    Wallet,
    Building,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Account } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddPaymentDialog from "../modals/AddPaymentDialog";

interface PaymentDetails {
    accountId: string;
    amount: number;
    details: object;
}

interface PaymentSelectorProps {
    accounts: Account[];
    grandTotal: number;
    selectedPayments: PaymentDetails[];
    setSelectedPayments: (payments: PaymentDetails[]) => void;
    error?: string | null;
    type: "BUY" | "SELL" | "MISC";
}

// Icon by account type
const AccountIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
        case "credit":
            return <CreditCard className="w-4 h-4" />;
        case "bank":
            return <Building className="w-4 h-4" />;
        default:
            return <Wallet className="w-4 h-4" />;
    }
};

const PaymentItem = ({
    payment,
    account,
    onRemove,
    type,
}: {
    payment: PaymentDetails;
    account: Account;
    onRemove: () => void;
    type: "BUY" | "SELL" | "MISC";
}) => {
    const hasInsufficientBalance = type === "BUY" && payment.amount > account.balance;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex justify-between items-center p-3 border-b last:border-b-0 group hover:bg-muted/50 rounded-md ${
                hasInsufficientBalance ? "bg-red-50 border-red-200" : ""
            }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        hasInsufficientBalance
                            ? "bg-red-100 text-red-600"
                            : "bg-primary/10 text-primary"
                    }`}
                >
                    <AccountIcon type={account.type} />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{account.name}</span>
                        {hasInsufficientBalance && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                Insufficient Balance
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{account.type}</span>
                        {type === "BUY" && (
                            <span
                                className={
                                    hasInsufficientBalance ? "text-red-600" : "text-green-600"
                                }
                            >
                                Balance: Rs {account.balance.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={hasInsufficientBalance ? "destructive" : "outline"}>
                    Rs {payment.amount.toFixed(2)}
                </Badge>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onRemove}
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove payment"
                >
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>
        </motion.div>
    );
};

const EmptyState = () => (
    <div className="py-8 text-center text-muted-foreground text-sm">
        <Wallet className="mx-auto mb-2 w-6 h-6" />
        <p>No payments added yet. Start by selecting a payment method.</p>
    </div>
);

const TotalSummary = ({ totalPaid, grandTotal }: { totalPaid: number; grandTotal: number }) => {
    const remaining = useMemo(() => grandTotal - totalPaid, [totalPaid, grandTotal]);
    return (
        <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Total Paid: Rs {totalPaid.toFixed(2)}</span>
            {remaining > 0 ? (
                <span className="text-xs text-muted-foreground">
                    Remaining: Rs {remaining.toFixed(2)}
                </span>
            ) : remaining < 0 ? (
                <span className="text-xs text-destructive">
                    Overpaid by Rs {Math.abs(remaining).toFixed(2)}
                </span>
            ) : null}
        </div>
    );
};

export default function PaymentSelector({
    accounts,
    grandTotal,
    selectedPayments,
    setSelectedPayments,
    error,
    type,
}: PaymentSelectorProps) {
    const totalPaid = useMemo(
        () => selectedPayments.reduce((acc, p) => acc + p.amount, 0),
        [selectedPayments]
    );

    const removePayment = (index: number) =>
        setSelectedPayments(selectedPayments.filter((_, i) => i !== index));

    const handleAddPayment = (amount: number, accountId: string, details: object) =>
        setSelectedPayments([...selectedPayments, { amount, accountId, details }]);

    const overpaidBy = useMemo(() => totalPaid - grandTotal, [totalPaid, grandTotal]);

    const insufficientBalancePayments = useMemo(() => {
        if (type !== "BUY") return [];
        return selectedPayments.filter((payment) => {
            const account = accounts.find((acc) => acc.id === payment.accountId);
            return account && payment.amount > account.balance;
        });
    }, [type, selectedPayments, accounts]);

    return (
        <Card className="bg-gray-100 border-0 shadow-none">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Select how you want to pay</CardDescription>
                    </div>
                    <TotalSummary totalPaid={totalPaid} grandTotal={grandTotal} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md flex gap-2 items-center text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                {overpaidBy > 0 && (
                    <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md flex gap-2 items-center text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Payment exceeds the total by Rs {Math.abs(overpaidBy).toFixed(2)}. Please
                        adjust.
                    </div>
                )}
                {insufficientBalancePayments.length > 0 && (
                    <div className="p-3 bg-red-100 text-red-800 rounded-md flex gap-2 items-center text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {insufficientBalancePayments.length === 1
                            ? "One payment exceeds account balance"
                            : `${insufficientBalancePayments.length} payments exceed account balances`}
                        . Please adjust payment amounts.
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Selected Payments</h3>
                    <AddPaymentDialog
                        type={type}
                        accounts={accounts}
                        remainingAmount={grandTotal}
                        onAddPayment={handleAddPayment}
                    />
                </div>

                <div
                    className={cn(
                        "rounded-md border",
                        selectedPayments.length === 0 ? "bg-muted/50" : "bg-background"
                    )}
                >
                    {selectedPayments.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <ScrollArea className="h-[280px] w-full p-3">
                            <AnimatePresence initial={false}>
                                {selectedPayments.map((payment, index) => {
                                    const account = accounts.find(
                                        (a) => a.id === payment.accountId
                                    );
                                    if (!account) return null;
                                    return (
                                        <PaymentItem
                                            key={`${payment.accountId}-${index}`}
                                            payment={payment}
                                            account={account}
                                            type={type}
                                            onRemove={() => removePayment(index)}
                                        />
                                    );
                                })}
                            </AnimatePresence>
                        </ScrollArea>
                    )}
                </div>

                {selectedPayments.length > 0 && grandTotal === 0 && (
                    <div className="bg-primary/10 text-primary text-sm p-3 rounded-md flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Payment complete! You're ready to proceed.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
