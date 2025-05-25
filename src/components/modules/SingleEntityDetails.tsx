import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    User,
    Phone,
    Mail,
    FileText,
    ShoppingCart,
    DollarSign,
    CreditCard,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertCircle,
} from "lucide-react";

import { Entity, Order, PaymentStatus } from "@/data/types";
import { Link } from "react-router-dom";

interface EntityPageProps {
    entity: Entity;
}

const EntityPage: React.FC<EntityPageProps> = ({ entity }) => {
    // Calculate paid amount for a specific order by summing all transaction amounts
    const calculateOrderPaidAmount = (order: Order): number => {
        if (!order.transactions || order.transactions.length === 0) {
            return 0;
        }

        return order.transactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);
    };

    // Calculate remaining amount for a specific order
    const calculateOrderRemaining = (order: Order): number => {
        const paidAmount = calculateOrderPaidAmount(order);
        return order.totalAmount - paidAmount;
    };

    // Calculate order statistics
    const calculateOrderStats = () => {
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

            // Calculate paid amount by summing all transaction amounts
            const paidAmount = calculateOrderPaidAmount(order);
            totalPaid += paidAmount;

            // Count order statuses
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
    };

    const stats = calculateOrderStats();

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const variants: Record<PaymentStatus, string> = {
            PAID: "bg-green-100 text-green-800 border-green-200",
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            PARTIAL: "bg-blue-100 text-blue-800 border-blue-200",
            FAILED: "bg-red-100 text-red-800 border-red-200",
            CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
        };

        return <Badge className={variants[status]}>{status}</Badge>;
    };

    const getOrderTypeIcon = (type: Order["type"]) => {
        switch (type) {
            case "BUY":
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case "SELL":
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case "MISC":
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Entity Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold">{entity.name}</CardTitle>
                            <p className="text-gray-600">Entity ID: {entity.id}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{entity.phone}</span>
                        </div>
                        {entity.email && (
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{entity.email}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Created: {formatDate(entity.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Updated: {formatDate(entity.updatedAt)}</span>
                        </div>
                    </div>
                    {entity.description && (
                        <div className="mt-4">
                            <p className="text-gray-700">{entity.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Orders Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.totalPaid)}
                                </p>
                            </div>
                            <CreditCard className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Remaining</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(stats.totalRemaining)}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Payment Progress</span>
                                <span>
                                    {stats.totalAmount > 0
                                        ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1)
                                        : 0}
                                    %
                                </span>
                            </div>
                            <Progress
                                value={
                                    stats.totalAmount > 0
                                        ? (stats.totalPaid / stats.totalAmount) * 100
                                        : 0
                                }
                                className="h-2"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Paid Orders</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {stats.paidOrders}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending Orders</p>
                                <p className="text-lg font-semibold text-yellow-600">
                                    {stats.pendingOrders}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Overdue Orders</p>
                                <p className="text-lg font-semibold text-red-600">
                                    {stats.overdueOrders}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {!entity.orders || entity.orders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No orders found for this entity.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entity.orders.map((order) => {
                                const paidAmount = calculateOrderPaidAmount(order);
                                const remaining = calculateOrderRemaining(order);

                                return (
                                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getOrderTypeIcon(order.type)}
                                                    <Link
                                                        to={`/org/${entity.organizationId}/orders/${order.id}`}
                                                        className="text-blue-600 hover:underline flex flex-col"
                                                    >
                                                        <h3 className="font-semibold">
                                                            {order.orderNumber}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {order.description || "No description"}
                                                        </p>
                                                    </Link>
                                                </div>
                                                <div className="text-right">
                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Base Amount</p>
                                                    <p className="font-semibold">
                                                        {formatCurrency(order.baseAmount)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-600">Total Amount</p>
                                                    <p className="font-semibold text-lg">
                                                        {formatCurrency(order.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Paid Amount</p>
                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(paidAmount)}
                                                    </p>
                                                    {order.transactions &&
                                                        order.transactions.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                ({order.transactions.length}{" "}
                                                                transaction
                                                                {order.transactions.length !== 1
                                                                    ? "s"
                                                                    : ""}
                                                                )
                                                            </p>
                                                        )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">
                                                        Remaining Amount
                                                    </p>
                                                    <p className="font-semibold text-red-600">
                                                        {formatCurrency(remaining)}
                                                    </p>
                                                </div>
                                            </div>

                                            {order.totalAmount > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Payment Progress</span>
                                                        <span>
                                                            {(
                                                                (paidAmount / order.totalAmount) *
                                                                100
                                                            ).toFixed(1)}
                                                            %
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            (paidAmount / order.totalAmount) * 100
                                                        }
                                                        className="h-1"
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EntityPage;
