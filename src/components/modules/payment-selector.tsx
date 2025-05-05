"use client";

import { useMemo } from "react";
import { Trash2, CreditCard, Wallet, Building, AlertCircle, AlertTriangle } from "lucide-react";

import type { Account } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AddPaymentDialog from "../modals/AddPaymentDialog";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentDetails {
    accountId: string;
    amount: number;
    details: object;
}

interface PaymentSelectorProps {
    accounts: Account[];
    remainingAmount: number;
    selectedPayments: PaymentDetails[];
    setSelectedPayments: (payments: PaymentDetails[]) => void;
    error?: string | null;
}

// Helper function to get icon based on account type
const getAccountIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case "credit":
            return <CreditCard className="h-4 w-4" />;
        case "bank":
            return <Building className="h-4 w-4" />;
        default:
            return <Wallet className="h-4 w-4" />;
    }
};

const PaymentItem = ({
    payment,
    account,
    onRemove,
}: {
    payment: PaymentDetails;
    account: Account | undefined;
    onRemove: () => void;
    index: number;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-between items-center py-3 px-2 border-b last:border-b-0 group hover:bg-muted/50 rounded-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {getAccountIcon(account?.type || "")}
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{account?.name || "Unknown Account"}</span>
                    <span className="text-xs text-muted-foreground">{account?.type}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-medium">
                    ${payment.amount.toFixed(2)}
                </Badge>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove payment from ${account?.name}`}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </motion.div>
    );
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No payments added</h3>
        <p className="text-xs text-muted-foreground max-w-[250px]">
            Add a payment method to continue with your transaction
        </p>
    </div>
);

export default function PaymentSelector({
    accounts,
    selectedPayments,
    setSelectedPayments,
    remainingAmount,
    error,
}: PaymentSelectorProps) {
    // Calculate total amount paid
    const totalPaid = useMemo(
        () => selectedPayments.reduce((sum, payment) => sum + payment.amount, 0),
        [selectedPayments]
    );

    // Calculate if payment exceeds the required amount
    const paymentExceeds = useMemo(() => {
        // If remainingAmount is negative, it means we've already paid more than needed
        return remainingAmount < 0;
    }, [remainingAmount]);

    const removePayment = (index: number) => {
        const remainingPayments = selectedPayments.filter((_, i) => i !== index);
        setSelectedPayments(remainingPayments);
    };

    const handleAddPayment = (amount: number, accountId: string, details: object) => {
        setSelectedPayments([...selectedPayments, { amount, accountId, details }]);
    };

    return (
        <Card className="shadow-sm border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Select how you want to pay</CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">Total: ${totalPaid.toFixed(2)}</span>
                        {remainingAmount > 0 ? (
                            <span className="text-xs text-muted-foreground">
                                Remaining: ${remainingAmount.toFixed(2)}
                            </span>
                        ) : (
                            <span className="text-xs text-destructive">
                                Overpaid by: ${Math.abs(remainingAmount).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    {paymentExceeds && (
                        <div className="bg-warning/10 text-yellow-700 text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                                Payment amount exceeds the required total by $
                                {Math.abs(remainingAmount).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Selected Payments</h3>
                        <AddPaymentDialog
                            type="BUY"
                            accounts={accounts}
                            remainingAmount={remainingAmount}
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
                                        const accountDetails = accounts.find(
                                            (a) => a.id === payment.accountId
                                        );
                                        return (
                                            <PaymentItem
                                                key={`${payment.accountId}-${index}`}
                                                payment={payment}
                                                account={accountDetails}
                                                onRemove={() => removePayment(index)}
                                                index={index}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </ScrollArea>
                        )}
                    </div>

                    {selectedPayments.length > 0 && remainingAmount <= 0 && !paymentExceeds && (
                        <div className="bg-primary/10 text-primary text-sm p-3 rounded-md flex items-center gap-2">
                            <span>Payment complete! You're ready to proceed.</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
