import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableComponent } from "@/components/modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Target,
    Percent,
    Calendar,
    FileText,
    ArrowUpRight,
} from "lucide-react";

interface ProfitLossData {
    summary: {
        totalOrders: number;
        dateRange: {};
        totals: {
            revenue: number;
            estimatedRevenue: number;
            costOfGoodsSold: number;
            grossProfit: number;
            estimatedGrossProfit: number;
            discount: number;
            tax: number;
            charges: number;
            netAmount: number;
            paidAmount: number;
        };
        metrics: {
            averageOrderValue: number;
            averageGrossProfit: number;
            overallProfitMargin: number;
            revenueVariance: number;
            profitVariance: number;
        };
        performance: {
            profitableOrders: number;
            lossOrders: number;
            breakEvenOrders: number;
            highestProfitOrder: any;
            lowestProfitOrder: any;
        };
    };
    orders: Array<{
        orderId: string;
        orderNumber: string;
        orderDate: string;
        entityName: string;
        discount: number;
        tax: number;
        charges: number;
        netOrderAmount: number;
        paidAmount: number;
        paymentStatus: string;
        totalRevenue: number;
        totalEstimatedRevenue: number;
        totalCostOfGoodsSold: number;
        totalGrossProfit: number;
        totalEstimatedGrossProfit: number;
        profitMargin: number;
        revenueVariance: number;
        profitVariance: number;
        itemDetails: Array<{
            productId?: string;
            productName: string;
            productSku?: string;
            quantity: number;
            buyPrice: number;
            sellPrice: number;
            estimatedPrice: number;
            costOfGoodsSold: number;
            revenue: number;
            estimatedRevenue: number;
            grossProfit: number;
            estimatedGrossProfit: number;
            profitMargin: number;
            varianceBetweenActualAndEstimated: number;
        }>;
    }>;
    generatedAt: string;
}

const ProfitLossPage = () => {
    const { orgId } = useOrg();
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfitLossData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`orgs/${orgId}/orders/profit-loss`);
            setData(res.data);
        } catch (err) {
            setError("Failed to fetch profit and loss data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchProfitLossData();
        }
    }, [orgId]);

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getPaymentStatusBadge = (status: string) => {
        const variants = {
            PAID: "bg-green-100 text-green-800 border-green-200",
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            PARTIAL: "bg-blue-100 text-blue-800 border-blue-200",
            FAILED: "bg-red-100 text-red-800 border-red-200",
        };
        return (
            <Badge
                className={
                    variants[status as keyof typeof variants] || variants.FAILED
                }
            >
                {status}
            </Badge>
        );
    };

    const getProfitColor = (profit: number) => {
        if (profit > 0) return "text-green-600";
        if (profit < 0) return "text-red-600";
        return "text-gray-600";
    };

    const orderColumns: ColumnDef<any>[] = [
        {
            header: "Order Number",
            accessorKey: "orderNumber",
        },
        {
            header: "Date",
            accessorKey: "orderDate",
            cell: ({ row }) => formatDate(row.original.orderDate),
        },
        {
            header: "Entity",
            accessorKey: "entityName",
        },
        {
            header: "Revenue",
            accessorKey: "totalRevenue",
            cell: ({ row }) => formatCurrency(row.original.totalRevenue),
        },
        {
            header: "COGS",
            accessorKey: "totalCostOfGoodsSold",
            cell: ({ row }) =>
                formatCurrency(row.original.totalCostOfGoodsSold),
        },
        {
            header: "Gross Profit",
            accessorKey: "totalGrossProfit",
            cell: ({ row }) => (
                <span className={getProfitColor(row.original.totalGrossProfit)}>
                    {formatCurrency(row.original.totalGrossProfit)}
                </span>
            ),
        },
        {
            header: "Profit Margin",
            accessorKey: "profitMargin",
            cell: ({ row }) => (
                <span className={getProfitColor(row.original.profitMargin)}>
                    {row.original.profitMargin.toFixed(2)}%
                </span>
            ),
        },
        {
            header: "Payment Status",
            accessorKey: "paymentStatus",
            cell: ({ row }) =>
                getPaymentStatusBadge(row.original.paymentStatus),
        },
        {
            header: "Paid Amount",
            accessorKey: "paidAmount",
            cell: ({ row }) => formatCurrency(row.original.paidAmount),
        },
    ];

    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-red-600">
                            {error || "No data available"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Profit & Loss
                    </h1>
                    <p className="text-gray-600">
                        Financial performance overview for your orders
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Generated: {formatDate(data.generatedAt)}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="h-6 w-6" />
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {formatCurrency(data.summary.totals.revenue)}
                        </div>
                        <div className="text-green-100 text-sm">
                            Total Revenue
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="h-6 w-6" />
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {formatCurrency(data.summary.totals.grossProfit)}
                        </div>
                        <div className="text-blue-100 text-sm">
                            Gross Profit
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Percent className="h-6 w-6" />
                            <div
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                    data.summary.metrics.overallProfitMargin >=
                                    0
                                        ? "bg-green-500/20 text-green-100"
                                        : "bg-red-500/20 text-red-100"
                                }`}
                            >
                                {data.summary.metrics.overallProfitMargin >= 0
                                    ? "+"
                                    : ""}
                                {data.summary.metrics.overallProfitMargin.toFixed(
                                    2
                                )}
                                %
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {data.summary.metrics.overallProfitMargin.toFixed(
                                2
                            )}
                            %
                        </div>
                        <div className="text-purple-100 text-sm">
                            Profit Margin
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingCart className="h-6 w-6" />
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {data.summary.totalOrders}
                        </div>
                        <div className="text-orange-100 text-sm">
                            Total Orders
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-500" />
                            Financial Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-semibold">
                                {formatCurrency(data.summary.totals.revenue)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Cost of Goods:
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(
                                    data.summary.totals.costOfGoodsSold
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Gross Profit:</span>
                            <span
                                className={`font-semibold ${getProfitColor(
                                    data.summary.totals.grossProfit
                                )}`}
                            >
                                {formatCurrency(
                                    data.summary.totals.grossProfit
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Net Amount:</span>
                            <span className="font-bold">
                                {formatCurrency(data.summary.totals.netAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Paid Amount:</span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency(data.summary.totals.paidAmount)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-500" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Avg Order Value:
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(
                                    data.summary.metrics.averageOrderValue
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Avg Gross Profit:
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(
                                    data.summary.metrics.averageGrossProfit
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Profit Margin:
                            </span>
                            <span
                                className={`font-semibold ${getProfitColor(
                                    data.summary.metrics.overallProfitMargin
                                )}`}
                            >
                                {data.summary.metrics.overallProfitMargin.toFixed(
                                    2
                                )}
                                %
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Revenue Variance:
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(
                                    data.summary.metrics.revenueVariance
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            Order Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Profitable Orders:
                            </span>
                            <span className="font-semibold text-green-600">
                                {data.summary.performance.profitableOrders}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Loss Orders:</span>
                            <span className="font-semibold text-red-600">
                                {data.summary.performance.lossOrders}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Break-even Orders:
                            </span>
                            <span className="font-semibold text-gray-600">
                                {data.summary.performance.breakEvenOrders}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 pt-2 border-t">
                            {data.summary.performance.profitableOrders}{" "}
                            profitable out of {data.summary.totalOrders} total
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Best and Worst Performing Orders */}
            {(data.summary.performance.highestProfitOrder ||
                data.summary.performance.lowestProfitOrder) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.summary.performance.highestProfitOrder && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <TrendingUp className="h-5 w-5" />
                                    Highest Profit Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Order:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.summary.performance
                                                .highestProfitOrder.orderNumber
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Entity:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.summary.performance
                                                .highestProfitOrder.entityName
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Revenue:
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            data.summary.performance
                                                .highestProfitOrder.totalRevenue
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Profit:
                                    </span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(
                                            data.summary.performance
                                                .highestProfitOrder
                                                .totalGrossProfit
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Margin:
                                    </span>
                                    <span className="font-bold text-green-600">
                                        {data.summary.performance.highestProfitOrder.profitMargin.toFixed(
                                            2
                                        )}
                                        %
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {data.summary.performance.lowestProfitOrder && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <TrendingDown className="h-5 w-5" />
                                    Lowest Profit Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Order:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.summary.performance
                                                .lowestProfitOrder.orderNumber
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Entity:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.summary.performance
                                                .lowestProfitOrder.entityName
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Revenue:
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            data.summary.performance
                                                .lowestProfitOrder.totalRevenue
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Profit:
                                    </span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(
                                            data.summary.performance
                                                .lowestProfitOrder
                                                .totalGrossProfit
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Margin:
                                    </span>
                                    <span className="font-bold text-red-600">
                                        {data.summary.performance.lowestProfitOrder.profitMargin.toFixed(
                                            2
                                        )}
                                        %
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Order Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableComponent
                        columns={orderColumns}
                        data={data.orders}
                        allowSearch={true}
                        allowPagination={true}
                        exportFileName={`profit-loss-${
                            new Date().toISOString().split("T")[0]
                        }`}
                        showFooter={true}
                        emptyStateMessage="No orders found for profit and loss analysis."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfitLossPage;
