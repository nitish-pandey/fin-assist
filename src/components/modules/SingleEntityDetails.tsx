import React, { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    User,
    Phone,
    Mail,
    FileText,
    TrendingUp,
    TrendingDown,
    Search,
    Download,
    ArrowUpCircle,
    ArrowDownCircle,
} from "lucide-react";

import { Account, Entity, Order, PaymentStatus } from "@/data/types";
import { Link } from "react-router-dom";
import AddEntity from "../modals/AddEntity";
import { api } from "@/utils/api";
import AddPaymentDialog from "../modals/AddPaymentDialog";

interface EntityPageProps {
    entity: Entity;
    accounts?: Account[];
}

interface FilterState {
    search: string;
    status: PaymentStatus | "ALL";
}

const EntityPage: React.FC<EntityPageProps> = React.memo(({ entity, accounts = [] }) => {
    // State for filters
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "ALL",
    });

    // Memoized calculation functions
    const calculateOrderPaidAmount = useCallback((order: Order): number => {
        return order.paidTillNow || 0;
    }, []);

    const calculateOrderRemaining = useCallback(
        (order: Order): number => {
            const paidAmount = calculateOrderPaidAmount(order);
            return order.totalAmount - paidAmount;
        },
        [calculateOrderPaidAmount]
    );

    // Separate buy and sell orders
    const { buyOrders, sellOrders } = useMemo(() => {
        if (!entity.orders) return { buyOrders: [], sellOrders: [] };

        return {
            buyOrders: entity.orders.filter((order) => order.type === "BUY"),
            sellOrders: entity.orders.filter((order) => order.type === "SELL"),
        };
    }, [entity.orders]);

    // Memoized order statistics calculation with proper buy/sell logic
    const stats = useMemo(() => {
        if (!entity.orders || entity.orders.length === 0) {
            return {
                totalOrders: 0,
                // Buy orders - amounts we owe to entity
                totalBuyAmount: 0,
                totalBuyPaid: 0,
                totalBuyRemaining: 0, // Amount to give
                // Sell orders - amounts entity owes us
                totalSellAmount: 0,
                totalSellPaid: 0,
                totalSellRemaining: 0, // Amount to take
                // Net balance
                netBalance: 0, // Positive = we owe entity, Negative = entity owes us
                paidOrders: 0,
                pendingOrders: 0,
            };
        }

        let totalBuyAmount = 0;
        let totalBuyPaid = 0;
        let totalSellAmount = 0;
        let totalSellPaid = 0;
        let paidOrders = 0;
        let pendingOrders = 0;

        entity.orders.forEach((order) => {
            const paidAmount = calculateOrderPaidAmount(order);

            if (order.type === "BUY") {
                // Buy orders - we owe money to the entity
                totalBuyAmount += order.totalAmount;
                totalBuyPaid += paidAmount;
            } else if (order.type === "SELL") {
                // Sell orders - entity owes money to us
                totalSellAmount += order.totalAmount;
                totalSellPaid += paidAmount;
            }

            switch (order.paymentStatus) {
                case "PAID":
                    paidOrders++;
                    break;
                case "PENDING":
                case "PARTIAL":
                    pendingOrders++;
                    break;
            }
        });

        const totalBuyRemaining = totalBuyAmount - totalBuyPaid;
        const totalSellRemaining = totalSellAmount - totalSellPaid;
        const netBalance = totalBuyRemaining - totalSellRemaining; // Positive = we owe, Negative = they owe

        return {
            totalOrders: entity.orders.length,
            totalBuyAmount,
            totalBuyPaid,
            totalBuyRemaining,
            totalSellAmount,
            totalSellPaid,
            totalSellRemaining,
            netBalance,
            paidOrders,
            pendingOrders,
        };
    }, [entity.orders, calculateOrderPaidAmount]);

    // Filtered orders (sorted by date, newest first)
    const filteredBuyOrders = useMemo(() => {
        if (!buyOrders) return [];

        let filtered = buyOrders.filter((order) => {
            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const matchesSearch =
                    order.orderNumber.toLowerCase().includes(searchTerm) ||
                    (order.description && order.description.toLowerCase().includes(searchTerm));
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status !== "ALL" && order.paymentStatus !== filters.status) {
                return false;
            }

            return true;
        });

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
    }, [buyOrders, filters]);

    const filteredSellOrders = useMemo(() => {
        if (!sellOrders) return [];

        let filtered = sellOrders.filter((order) => {
            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const matchesSearch =
                    order.orderNumber.toLowerCase().includes(searchTerm) ||
                    (order.description && order.description.toLowerCase().includes(searchTerm));
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status !== "ALL" && order.paymentStatus !== filters.status) {
                return false;
            }

            return true;
        });

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
    }, [sellOrders, filters]);

    const getPaymentStatusBadge = useCallback((status: PaymentStatus) => {
        const variants: Record<PaymentStatus, string> = {
            PAID: "bg-green-100 text-green-800 border-green-200",
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            PARTIAL: "bg-blue-100 text-blue-800 border-blue-200",
            FAILED: "bg-red-100 text-red-800 border-red-200",
            CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
        };

        return <Badge className={variants[status]}>{status}</Badge>;
    }, []);

    const formatCurrency = useCallback((amount: number) => {
        return `Nrs ${amount.toLocaleString("en-NP", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, []);

    // Export functionality
    const exportToCSV = useCallback(() => {
        const headers = [
            "Order Number",
            "Type",
            "Status",
            "Date",
            "Total Amount",
            "Paid Amount",
            "Remaining",
            "Description",
        ];
        const allOrders = [...filteredBuyOrders, ...filteredSellOrders];
        const csvData = allOrders.map((order) => {
            const paidAmount = calculateOrderPaidAmount(order);
            const remaining = calculateOrderRemaining(order);
            return [
                order.orderNumber,
                order.type,
                order.paymentStatus,
                formatDate(order.createdAt),
                order.totalAmount,
                paidAmount,
                remaining,
                order.description || "",
            ];
        });

        const csvContent = [headers, ...csvData]
            .map((row) => row.map((field) => `"${field}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entity.name}_orders_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }, [
        filteredBuyOrders,
        filteredSellOrders,
        entity.name,
        calculateOrderPaidAmount,
        calculateOrderRemaining,
        formatDate,
    ]);

    const exportToPDF = useCallback(async () => {
        // This would typically use a PDF library like jsPDF
        // For now, we'll create a simple HTML page and print it
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${entity.name} - Entity Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                    .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .currency { text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${entity.name}</h1>
                    <p>Entity ID: ${entity.id}</p>
                    <p>Phone: ${entity.phone}</p>
                    ${entity.email ? `<p>Email: ${entity.email}</p>` : ""}
                    <p>Report Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <h3>Total Orders</h3>
                        <p>${stats.totalOrders}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Net Balance</h3>
                        <p>${formatCurrency(Math.abs(stats.netBalance))} ${
            stats.netBalance >= 0 ? "(To Give)" : "(To Take)"
        }</p>
                    </div>
                    <div class="stat-card">
                        <h3>Buy Orders Due</h3>
                        <p>${formatCurrency(stats.totalBuyRemaining)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Sell Orders Due</h3>
                        <p>${formatCurrency(stats.totalSellRemaining)}</p>
                    </div>
                </div>
                
                <h2>Orders</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th class="currency">Total Amount</th>
                            <th class="currency">Paid Amount</th>
                            <th class="currency">Remaining</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[...filteredBuyOrders, ...filteredSellOrders]
                            .map((order) => {
                                const paidAmount = calculateOrderPaidAmount(order);
                                const remaining = calculateOrderRemaining(order);
                                return `
                                <tr>
                                    <td>${order.orderNumber}</td>
                                    <td>${order.type}</td>
                                    <td>${order.paymentStatus}</td>
                                    <td>${formatDate(order.createdAt)}</td>
                                    <td class="currency">${formatCurrency(order.totalAmount)}</td>
                                    <td class="currency">${formatCurrency(paidAmount)}</td>
                                    <td class="currency">${formatCurrency(remaining)}</td>
                                </tr>
                            `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }, [
        entity,
        stats,
        filteredBuyOrders,
        filteredSellOrders,
        calculateOrderPaidAmount,
        calculateOrderRemaining,
        formatDate,
        formatCurrency,
    ]);

    // Filter handlers
    const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleAddPayment = useCallback(
        async (amount: number, accountId: string) => {
            if (amount <= 0) {
                return;
            }
            let remainingAmount = amount;
            const toPayOrders: {
                orderId: string;
                accountId: string;
                amount: number;
            }[] = [];

            // Prioritize buy orders (money we owe to entity) first
            const ordersToProcess = entity.orders
                ? [...entity.orders]
                      .filter((order) => calculateOrderRemaining(order) > 0)
                      .sort((a, b) => {
                          // Buy orders first (we owe money), then by date
                          if (a.type === "BUY" && b.type !== "BUY") return -1;
                          if (b.type === "BUY" && a.type !== "BUY") return 1;
                          return a.createdAt.localeCompare(b.createdAt);
                      })
                : [];

            for (const order of ordersToProcess) {
                if (remainingAmount <= 0) {
                    break;
                }
                const toPay = calculateOrderRemaining(order);
                if (toPay <= 0) continue;
                const remaining = Math.min(remainingAmount, toPay);
                remainingAmount -= remaining;
                if (remaining > 0) {
                    toPayOrders.push({
                        orderId: order.id,
                        accountId: accountId,
                        amount: remaining,
                    });
                }
            }

            try {
                await Promise.all(
                    toPayOrders.map(async (order) => {
                        await api.post(
                            `/orgs/${entity.organizationId}/orders/${order.orderId}/transactions`,
                            {
                                amount: order.amount,
                                accountId: order.accountId,
                                details: {
                                    type: "PAYMENT",
                                    description: `Payment for Order ${order.orderId}`,
                                },
                            }
                        );
                    })
                );
                window.location.reload();
            } catch (error) {
                console.error("Error adding payment:", error);
            }
        },
        [entity.orders, entity.organizationId, calculateOrderRemaining]
    );
    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Entity Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">{entity.name}</h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{entity.phone}</span>
                                </span>
                                {entity.email && (
                                    <span className="flex items-center space-x-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{entity.email}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportToCSV}
                            className="h-8 px-2"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportToPDF}
                            className="h-8 px-2"
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                        <AddPaymentDialog
                            accounts={accounts}
                            type="MISC"
                            remainingAmount={Math.abs(stats.netBalance)}
                            onAddPayment={handleAddPayment}
                        />
                        <AddEntity
                            entity={entity}
                            addEntity={async (updates) => {
                                const newEntity = { ...entity, ...updates };
                                await api.put(
                                    `/orgs/${entity.organizationId}/entities/${entity.id}`,
                                    newEntity
                                );
                                window.location.reload();
                            }}
                            text="Edit"
                        />
                    </div>
                </div>
                {entity.description && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm text-gray-600">
                        {entity.description}
                    </div>
                )}
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>

                {/* Net Balance Card */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Net Balance</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                {stats.netBalance >= 0 ? (
                                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                                )}
                                <span
                                    className={`text-2xl font-bold ${
                                        stats.netBalance >= 0 ? "text-red-600" : "text-green-600"
                                    }`}
                                >
                                    {formatCurrency(Math.abs(stats.netBalance))}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.netBalance >= 0
                                    ? "You owe this entity"
                                    : "This entity owes you"}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Total Orders</div>
                            <div className="text-xl font-bold">{stats.totalOrders}</div>
                        </div>
                    </div>
                </div>

                {/* Buy & Sell Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buy Orders Summary */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            <h3 className="font-semibold text-red-900">
                                Buy Orders (Amount to Give)
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Amount:</span>
                                <span className="font-medium">
                                    {formatCurrency(stats.totalBuyAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Paid:</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(stats.totalBuyPaid)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-red-200 pt-2">
                                <span className="font-medium text-gray-900">Remaining:</span>
                                <span className="font-bold text-red-600">
                                    {formatCurrency(stats.totalBuyRemaining)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sell Orders Summary */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-green-900">
                                Sell Orders (Amount to Take)
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Amount:</span>
                                <span className="font-medium">
                                    {formatCurrency(stats.totalSellAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Received:</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(stats.totalSellPaid)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-green-200 pt-2">
                                <span className="font-medium text-gray-900">Remaining:</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(stats.totalSellRemaining)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Search and Status Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search orders..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => handleFilterChange("status", value)}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Buy Orders Section */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center space-x-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            <h3 className="text-md font-semibold text-red-900">
                                Buy Orders - Amount to Give
                            </h3>
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {filteredBuyOrders.length}
                        </Badge>
                        {stats.totalBuyRemaining > 0 && (
                            <Badge className="bg-red-600 text-white">
                                Due: {formatCurrency(stats.totalBuyRemaining)}
                            </Badge>
                        )}
                    </div>

                    {filteredBuyOrders.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <TrendingDown className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No buy orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200">
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Order
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            To Give
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-center">
                                            Progress
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBuyOrders.map((order) => {
                                        const paidAmount = order.paidTillNow || 0;
                                        const remaining = order.totalAmount - paidAmount;
                                        const progressPercentage =
                                            order.totalAmount > 0
                                                ? (paidAmount / order.totalAmount) * 100
                                                : 0;

                                        return (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-red-50 border-b border-gray-100"
                                            >
                                                <TableCell className="py-3">
                                                    <Link
                                                        to={`/org/${entity.organizationId}/orders/${order.id}`}
                                                        className="text-blue-600 hover:underline font-medium text-sm"
                                                    >
                                                        {order.orderNumber}
                                                    </Link>
                                                    {order.description && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {order.description}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {formatDate(order.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium">
                                                    {formatCurrency(order.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium text-green-600">
                                                    {formatCurrency(paidAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-bold text-red-600">
                                                    {formatCurrency(remaining)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1">
                                                            <Progress
                                                                value={progressPercentage}
                                                                className="h-2"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 min-w-[35px]">
                                                            {progressPercentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Sell Orders Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h3 className="text-md font-semibold text-green-900">
                                Sell Orders - Amount to Take
                            </h3>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {filteredSellOrders.length}
                        </Badge>
                        {stats.totalSellRemaining > 0 && (
                            <Badge className="bg-green-600 text-white">
                                Due: {formatCurrency(stats.totalSellRemaining)}
                            </Badge>
                        )}
                    </div>

                    {filteredSellOrders.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No sell orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200">
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Order
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            Received
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-right">
                                            To Take
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 text-center">
                                            Progress
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSellOrders.map((order) => {
                                        const paidAmount = calculateOrderPaidAmount(order);
                                        const remaining = calculateOrderRemaining(order);
                                        const progressPercentage =
                                            order.totalAmount > 0
                                                ? (paidAmount / order.totalAmount) * 100
                                                : 0;

                                        return (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-green-50 border-b border-gray-100"
                                            >
                                                <TableCell className="py-3">
                                                    <Link
                                                        to={`/org/${entity.organizationId}/orders/${order.id}`}
                                                        className="text-blue-600 hover:underline font-medium text-sm"
                                                    >
                                                        {order.orderNumber}
                                                    </Link>
                                                    {order.description && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {order.description}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {formatDate(order.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium">
                                                    {formatCurrency(order.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium text-green-600">
                                                    {formatCurrency(paidAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-bold text-green-600">
                                                    {formatCurrency(remaining)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1">
                                                            <Progress
                                                                value={progressPercentage}
                                                                className="h-2"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 min-w-[35px]">
                                                            {progressPercentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

EntityPage.displayName = "EntityPage";

export default EntityPage;
