import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight, Receipt, Calendar } from "lucide-react";
import { Transaction } from "@/data/types";

interface POSTransactionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: Transaction[];
}

export default function POSTransactionsDialog({
    open,
    onOpenChange,
    transactions,
}: POSTransactionsDialogProps) {
    const formatCurrency = (amount: number) => `Rs ${amount.toFixed(2)}`;

    const totalIn = transactions
        .filter((t) => t.type === "SELL")
        .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = transactions
        .filter((t) => t.type === "BUY")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Register Transactions ({transactions.length})
                    </DialogTitle>
                </DialogHeader>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <ArrowDownLeft className="h-3 w-3" /> Money In
                        </p>
                        <p className="font-semibold text-green-700">{formatCurrency(totalIn)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" /> Money Out
                        </p>
                        <p className="font-semibold text-red-700">{formatCurrency(totalOut)}</p>
                    </div>
                </div>

                <ScrollArea className="max-h-[50vh]">
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((txn) => {
                                const isIncome = txn.type === "SELL";
                                return (
                                    <div
                                        key={txn.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    isIncome
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-red-100 text-red-600"
                                                }`}
                                            >
                                                {isIncome ? (
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        {txn.account?.name || "Unknown"}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {txn.type}
                                                    </Badge>
                                                </div>
                                                {txn.description && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                        {txn.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(txn.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`font-semibold ${
                                                isIncome ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            {isIncome ? "+" : "-"}
                                            {formatCurrency(txn.amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
