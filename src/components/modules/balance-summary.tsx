"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle, Wallet } from "lucide-react";
import type { Account } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BalanceSummaryProps {
    payments: Array<{ amount: number; accountId: string }>;
    accounts: Account[];
    orderType: "BUY" | "SELL" | "MISC";
    className?: string;
}

interface AccountSummary {
    account: Account;
    totalRequired: number;
    balance: number;
    shortfall: number;
    hasInsufficientBalance: boolean;
}

export function BalanceSummary({ 
    payments, 
    accounts, 
    orderType, 
    className = "" 
}: BalanceSummaryProps) {
    const accountSummaries = useMemo(() => {
        if (orderType !== "BUY" || payments.length === 0) return [];

        // Group payments by account
        const accountPayments = new Map<string, number>();
        payments.forEach(payment => {
            const current = accountPayments.get(payment.accountId) || 0;
            accountPayments.set(payment.accountId, current + payment.amount);
        });

        // Create summaries for accounts with payments
        const summaries: AccountSummary[] = [];
        accountPayments.forEach((totalRequired, accountId) => {
            const account = accounts.find(acc => acc.id === accountId);
            if (account) {
                const shortfall = Math.max(0, totalRequired - account.balance);
                summaries.push({
                    account,
                    totalRequired,
                    balance: account.balance,
                    shortfall,
                    hasInsufficientBalance: shortfall > 0,
                });
            }
        });

        return summaries.sort((a, b) => {
            // Sort by insufficient balance first, then by account name
            if (a.hasInsufficientBalance !== b.hasInsufficientBalance) {
                return a.hasInsufficientBalance ? -1 : 1;
            }
            return a.account.name.localeCompare(b.account.name);
        });
    }, [payments, accounts, orderType]);

    const totalShortfall = useMemo(() => {
        return accountSummaries.reduce((sum, summary) => sum + summary.shortfall, 0);
    }, [accountSummaries]);

    const hasAnyInsufficientBalance = accountSummaries.some(s => s.hasInsufficientBalance);

    if (orderType !== "BUY" || accountSummaries.length === 0) {
        return null;
    }

    return (
        <Card className={`${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4" />
                    Account Balance Summary
                    {hasAnyInsufficientBalance ? (
                        <Badge variant="destructive" className="ml-auto">
                            Insufficient Balance
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                            All Good
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {accountSummaries.map((summary) => (
                    <div 
                        key={summary.account.id}
                        className={`p-3 rounded-lg border ${
                            summary.hasInsufficientBalance 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-green-50 border-green-200'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {summary.hasInsufficientBalance ? (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                <span className="font-medium text-sm">
                                    {summary.account.name}
                                </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {summary.account.type}
                            </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Available Balance:</span>
                                <span className="font-medium">Rs {summary.balance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Required Amount:</span>
                                <span className="font-medium">Rs {summary.totalRequired.toFixed(2)}</span>
                            </div>
                            {summary.hasInsufficientBalance && (
                                <div className="flex justify-between border-t pt-1 mt-1">
                                    <span className="text-red-600 font-medium">Shortfall:</span>
                                    <span className="font-bold text-red-600">
                                        Rs {summary.shortfall.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {totalShortfall > 0 && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-800">
                                Total Shortfall:
                            </span>
                            <span className="font-bold text-red-800">
                                Rs {totalShortfall.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                            You need to add Rs {totalShortfall.toFixed(2)} more to your accounts or reduce payment amounts.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
