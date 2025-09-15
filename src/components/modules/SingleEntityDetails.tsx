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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    User,
    Phone,
    Mail,
    FileText,
    ShoppingCart,
    CreditCard,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Search,
    Filter,
    Download,
    Grid,
    List,
} from "lucide-react";

import { Account, Entity, Order, PaymentStatus } from "@/data/types";
import { Link } from "react-router-dom";
import { FaMoneyBill } from "react-icons/fa";
import AddEntity from "../modals/AddEntity";
import { api } from "@/utils/api";
import AddPaymentDialog from "../modals/AddPaymentDialog";

interface EntityPageProps {
    entity: Entity;
    accounts?: Account[];
}

type ViewMode = "grid" | "table";

interface FilterState {
    search: string;
    status: PaymentStatus | "ALL";
    type: Order["type"] | "ALL";
    dateFrom: string;
    dateTo: string;
    amountMin: string;
    amountMax: string;
}

const EntityPage: React.FC<EntityPageProps> = React.memo(({ entity, accounts = [] }) => {
    // State for filters, sorting, and view mode
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "ALL",
        type: "ALL",
        dateFrom: "",
        dateTo: "",
        amountMin: "",
        amountMax: "",
    });

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [showFilters, setShowFilters] = useState(false);

    // Memoized calculation functions
    const calculateOrderPaidAmount = useCallback((order: Order): number => {
        if (!order.transactions || order.transactions.length === 0) {
            return 0;
        }

        return order.transactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);
    }, []);

    const calculateOrderRemaining = useCallback(
        (order: Order): number => {
            const paidAmount = calculateOrderPaidAmount(order);
            return order.totalAmount - paidAmount;
        },
        [calculateOrderPaidAmount]
    );

    // Memoized order statistics calculation
    const stats = useMemo(() => {
        if (!entity.orders || entity.orders.length === 0) {
            return {
                totalOrders: 0,
                totalAmount: 0,
                totalPaid: 0,
                totalRemaining: 0,
                paidOrders: 0,
                pendingOrders: 0,
                overdueOrders: 0,
            };
        }

        let totalAmount = 0;
        let totalPaid = 0;
        let paidOrders = 0;
        let pendingOrders = 0;
        let overdueOrders = 0;

        entity.orders.forEach((order) => {
            totalAmount += order.totalAmount;
            const paidAmount = calculateOrderPaidAmount(order);
            totalPaid += paidAmount;

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

        return {
            totalOrders: entity.orders.length,
            totalAmount,
            totalPaid,
            totalRemaining: totalAmount - totalPaid,
            paidOrders,
            pendingOrders,
            overdueOrders,
        };
    }, [entity.orders, calculateOrderPaidAmount]);

    // Filtered orders (sorted by date, newest first)
    const filteredAndSortedOrders = useMemo(() => {
        if (!entity.orders) return [];

        let filtered = entity.orders.filter((order) => {
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

            // Type filter
            if (filters.type !== "ALL" && order.type !== filters.type) {
                return false;
            }

            // Date filter
            if (filters.dateFrom) {
                const orderDate = new Date(order.createdAt);
                const fromDate = new Date(filters.dateFrom);
                if (orderDate < fromDate) return false;
            }

            if (filters.dateTo) {
                const orderDate = new Date(order.createdAt);
                const toDate = new Date(filters.dateTo);
                if (orderDate > toDate) return false;
            }

            // Amount filter
            if (filters.amountMin && order.totalAmount < parseFloat(filters.amountMin)) {
                return false;
            }

            if (filters.amountMax && order.totalAmount > parseFloat(filters.amountMax)) {
                return false;
            }

            return true;
        });

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filtered;
    }, [entity.orders, filters]);

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

    const getOrderTypeIcon = useCallback((type: Order["type"]) => {
        switch (type) {
            case "BUY":
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case "SELL":
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case "MISC":
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
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
            "Base Amount",
            "Total Amount",
            "Paid Amount",
            "Remaining",
            "Description",
        ];
        const csvData = filteredAndSortedOrders.map((order) => {
            const paidAmount = calculateOrderPaidAmount(order);
            const remaining = calculateOrderRemaining(order);
            return [
                order.orderNumber,
                order.type,
                order.paymentStatus,
                formatDate(order.createdAt),
                order.baseAmount,
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
        filteredAndSortedOrders,
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
                        <h3>Total Amount</h3>
                        <p>${formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Paid</h3>
                        <p>${formatCurrency(stats.totalPaid)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Remaining</h3>
                        <p>${formatCurrency(stats.totalRemaining)}</p>
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
                        ${filteredAndSortedOrders
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
        filteredAndSortedOrders,
        calculateOrderPaidAmount,
        calculateOrderRemaining,
        formatDate,
        formatCurrency,
    ]);

    // Filter and sort handlers
    const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            search: "",
            status: "ALL",
            type: "ALL",
            dateFrom: "",
            dateTo: "",
            amountMin: "",
            amountMax: "",
        });
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

            for (const order of entity.orders
                ? entity.orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                : []) {
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
            {/* Compact Entity Header */}
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
                            remainingAmount={stats.totalRemaining}
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

            {/* Compact Statistics */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalOrders}</div>
                        <div className="text-xs text-gray-500">Orders</div>
                    </div>
                    <div className="text-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <FaMoneyBill className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(stats.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-xl font-bold text-green-600">
                            {formatCurrency(stats.totalPaid)}
                        </div>
                        <div className="text-xs text-gray-500">Paid</div>
                    </div>
                    <div className="text-center">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-xl font-bold text-red-600">
                            {formatCurrency(stats.totalRemaining)}
                        </div>
                        <div className="text-xs text-gray-500">Due</div>
                    </div>
                </div>

                {/* Compact Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Payment Progress</span>
                        <span className="font-medium">
                            {stats.totalAmount > 0
                                ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1)
                                : 0}
                            %
                        </span>
                    </div>
                    <Progress
                        value={
                            stats.totalAmount > 0 ? (stats.totalPaid / stats.totalAmount) * 100 : 0
                        }
                        className="h-2"
                    />
                </div>
            </div>

            {/* Compact Orders Management */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                            <Badge variant="secondary" className="text-xs">
                                {filteredAndSortedOrders.length}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("table")}
                                className="h-8 px-2"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className="h-8 px-2"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Sheet open={showFilters} onOpenChange={setShowFilters}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Filter Orders</SheetTitle>
                                    </SheetHeader>
                                    <div className="space-y-4 mt-6">
                                        <div>
                                            <label className="text-sm font-medium">Search</label>
                                            <Input
                                                placeholder="Order number or description..."
                                                value={filters.search}
                                                onChange={(e) =>
                                                    handleFilterChange("search", e.target.value)
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Status</label>
                                            <Select
                                                value={filters.status}
                                                onValueChange={(value) =>
                                                    handleFilterChange("status", value)
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Status</SelectItem>
                                                    <SelectItem value="PAID">Paid</SelectItem>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                                    <SelectItem value="FAILED">Failed</SelectItem>
                                                    <SelectItem value="CANCELLED">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Type</label>
                                            <Select
                                                value={filters.type}
                                                onValueChange={(value) =>
                                                    handleFilterChange("type", value)
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Types</SelectItem>
                                                    <SelectItem value="BUY">Buy</SelectItem>
                                                    <SelectItem value="SELL">Sell</SelectItem>
                                                    <SelectItem value="MISC">
                                                        Miscellaneous
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Date From
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={filters.dateFrom}
                                                    onChange={(e) =>
                                                        handleFilterChange(
                                                            "dateFrom",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Date To
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={filters.dateTo}
                                                    onChange={(e) =>
                                                        handleFilterChange("dateTo", e.target.value)
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Min Amount
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={filters.amountMin}
                                                    onChange={(e) =>
                                                        handleFilterChange(
                                                            "amountMin",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Max Amount
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="999999.00"
                                                    value={filters.amountMax}
                                                    onChange={(e) =>
                                                        handleFilterChange(
                                                            "amountMax",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 pt-4">
                                            <Button
                                                onClick={clearFilters}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                Clear All
                                            </Button>
                                            <Button
                                                onClick={() => setShowFilters(false)}
                                                className="flex-1"
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Compact Search Bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search orders..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {!entity.orders || entity.orders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No orders found</p>
                        </div>
                    ) : filteredAndSortedOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm mb-3">No matching orders</p>
                            <Button onClick={clearFilters} variant="outline" size="sm">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            {viewMode === "table" ? (
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
                                                    Due
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600 text-center">
                                                    Progress
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedOrders.map((order) => {
                                                const paidAmount = calculateOrderPaidAmount(order);
                                                const remaining = calculateOrderRemaining(order);
                                                const progressPercentage =
                                                    order.totalAmount > 0
                                                        ? (paidAmount / order.totalAmount) * 100
                                                        : 0;

                                                return (
                                                    <TableRow
                                                        key={order.id}
                                                        className="hover:bg-gray-50 border-b border-gray-100"
                                                    >
                                                        <TableCell className="py-3">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                                                    {getOrderTypeIcon(order.type)}
                                                                </div>
                                                                <Link
                                                                    to={`/org/${entity.organizationId}/orders/${order.id}`}
                                                                    className="text-blue-600 hover:underline font-medium text-sm"
                                                                >
                                                                    {order.orderNumber}
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getPaymentStatusBadge(
                                                                order.paymentStatus
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-600">
                                                            {formatDate(order.createdAt)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm font-medium">
                                                            {formatCurrency(order.totalAmount)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm font-medium text-red-600">
                                                            {formatCurrency(remaining)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="flex-1">
                                                                    <Progress
                                                                        value={progressPercentage}
                                                                        className="h-1"
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-500 min-w-[30px]">
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
                            ) : (
                                <div className="space-y-3">
                                    {filteredAndSortedOrders.map((order) => {
                                        const paidAmount = calculateOrderPaidAmount(order);
                                        const remaining = calculateOrderRemaining(order);
                                        const progressPercentage =
                                            order.totalAmount > 0
                                                ? (paidAmount / order.totalAmount) * 100
                                                : 0;

                                        return (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            {getOrderTypeIcon(order.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                to={`/org/${entity.organizationId}/orders/${order.id}`}
                                                                className="text-blue-600 hover:underline font-medium block"
                                                            >
                                                                {order.orderNumber}
                                                            </Link>
                                                            <p className="text-sm text-gray-600">
                                                                {order.type
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    order.type
                                                                        .slice(1)
                                                                        .toLowerCase()}{" "}
                                                                Order
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                                {order.description ||
                                                                    "No description"}
                                                            </p>
                                                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                                                <span>
                                                                    {formatDate(order.createdAt)}
                                                                </span>
                                                                <span>
                                                                    {order.transactions?.length ||
                                                                        0}{" "}
                                                                    transactions
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        {getPaymentStatusBadge(order.paymentStatus)}
                                                        <div className="mt-2 space-y-1 text-xs">
                                                            <div className="text-gray-600">
                                                                Total:{" "}
                                                                <span className="font-medium text-gray-900">
                                                                    {formatCurrency(
                                                                        order.totalAmount
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="text-red-600">
                                                                Due:{" "}
                                                                <span className="font-medium">
                                                                    {formatCurrency(remaining)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {order.totalAmount > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-gray-600">
                                                                Payment Progress
                                                            </span>
                                                            <span className="font-medium">
                                                                {progressPercentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={progressPercentage}
                                                            className="h-1"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

EntityPage.displayName = "EntityPage";

export default EntityPage;
