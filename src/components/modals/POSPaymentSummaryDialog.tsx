import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Wallet,
    CreditCard,
    Building,
    Banknote,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Clock,
} from "lucide-react";

interface PaymentSummaryItem {
    accountId: string;
    accountName: string;
    accountType: string;
    totalIn: number;
    totalOut: number;
    countIn: number;
    countOut: number;
}

interface POSPaymentSummaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentSummary: PaymentSummaryItem[];
    openingBalance: number;
    totalMoneyIn: number;
    totalMoneyOut: number;
    expectedBalance: number;
    orderCount: number;
    transactionCount: number;
    registerOpenedAt: string;
}

const AccountIcon = ({ type }: { type: string }) => {
    switch (type?.toLowerCase()) {
        case "credit":
        case "bank_od":
            return <CreditCard className="h-4 w-4" />;
        case "bank":
            return <Building className="h-4 w-4" />;
        case "cash_counter":
            return <Banknote className="h-4 w-4" />;
        default:
            return <Wallet className="h-4 w-4" />;
    }
};

export default function POSPaymentSummaryDialog({
    open,
    onOpenChange,
    paymentSummary,
    openingBalance,
    totalMoneyIn,
    totalMoneyOut,
    expectedBalance,
    orderCount,
    transactionCount,
    registerOpenedAt,
}: POSPaymentSummaryDialogProps) {
    const formatCurrency = (amount: number) => `Rs ${amount.toFixed(2)}`;

    const formatDuration = (dateStr: string) => {
        const start = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Register Summary
                    </DialogTitle>
                </DialogHeader>

                {/* Overview Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600">Orders</p>
                        <p className="text-xl font-bold text-blue-700">{orderCount}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600">Transactions</p>
                        <p className="text-xl font-bold text-purple-700">{transactionCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" /> Duration
                        </p>
                        <p className="text-xl font-bold text-gray-700">
                            {formatDuration(registerOpenedAt)}
                        </p>
                    </div>
                </div>

                {/* Balance Flow */}
                <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Opening</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(openingBalance)}
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Expected</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(expectedBalance)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-3 border-t">
                        <div className="flex-1 flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <div>
                                <p className="text-xs">Money In</p>
                                <p className="font-semibold">+{formatCurrency(totalMoneyIn)}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-2 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            <div>
                                <p className="text-xs">Money Out</p>
                                <p className="font-semibold">-{formatCurrency(totalMoneyOut)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* By Account Breakdown */}
                <div>
                    <h4 className="text-sm font-medium mb-2">By Account</h4>
                    <ScrollArea className="max-h-[40vh]">
                        {paymentSummary.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <Wallet className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No transactions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {paymentSummary.map((item) => {
                                    const netAmount = item.totalIn - item.totalOut;
                                    return (
                                        <div key={item.accountId} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                        <AccountIcon type={item.accountType} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {item.accountName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.countIn + item.countOut} txns
                                                        </p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`font-bold ${
                                                        netAmount >= 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {netAmount >= 0 ? "+" : ""}
                                                    {formatCurrency(netAmount)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-xs pl-10">
                                                {item.totalIn > 0 && (
                                                    <span className="text-green-600">
                                                        ↑ {formatCurrency(item.totalIn)} (
                                                        {item.countIn})
                                                    </span>
                                                )}
                                                {item.totalOut > 0 && (
                                                    <span className="text-red-600">
                                                        ↓ {formatCurrency(item.totalOut)} (
                                                        {item.countOut})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
