"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Order, OrderItem, Transaction, Entity } from "@/data/types";
import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import AddTransaction from "@/components/forms/AddTransaction";

const SingleOrderPage = () => {
    const { orgId } = useOrg();
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const fetchedOrder = await (await api.get(`/orgs/${orgId}/orders/${orderId}`)).data;
            setOrder(fetchedOrder);
            setError(null);
        } catch (err) {
            setError("Failed to fetch order data");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!orgId || !orderId) return;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const fetchedOrder = await (await api.get(`/orgs/${orgId}/orders/${orderId}`)).data;
                setOrder(fetchedOrder);
                setError(null);
            } catch (err) {
                setError("Failed to fetch order data");
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orgId, orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || "Order not found. Please try again later."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/org/${orgId}/orders/view`}>
                                Orders
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Order #{order.orderNumber}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex gap-4">
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Invoice
                    </Button>
                    {order.paymentStatus !== "PAID" && (
                        <AddTransaction
                            remainingBalance={order.totalAmount}
                            orgId={orgId}
                            orderId={order.id}
                            refetch={fetchOrder}
                        />
                    )}
                </div>
            </div>

            <div className="space-y-6 print:space-y-4">
                <OrderHeader order={order} />

                {order.entity && <EntityDetails entity={order.entity} />}

                {order.items && order.items.length > 0 && <OrderItems items={order.items} />}

                {order.transactions && order.transactions.length > 0 && (
                    <OrderTransactions transactions={order.transactions} />
                )}

                <OrderSummary order={order} />
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 20mm;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .container {
                        max-width: 100% !important;
                    }

                    .print\\:hidden {
                        display: none !important;
                    }

                    .print\\:space-y-4 > * + * {
                        margin-top: 1rem !important;
                    }

                    .card {
                        border: 1px solid #e2e8f0;
                        border-radius: 0.375rem;
                        box-shadow: none;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th,
                    td {
                        border: 1px solid #e2e8f0;
                        padding: 0.5rem;
                        text-align: left;
                    }

                    th {
                        background-color: #f7fafc !important;
                    }
                }
            `}</style>
        </div>
    );
};

const OrderHeader = ({ order }: { order: Order }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Order #{order.orderNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
            </p>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center">
                <Badge
                    variant={order.paymentStatus === "PAID" ? "outline" : "destructive"}
                    className="px-3 py-1 text-lg"
                >
                    {order.paymentStatus}
                </Badge>
                <p className="text-xl font-semibold">Total: ${order.totalAmount.toFixed(2)}</p>
            </div>
        </CardContent>
    </Card>
);

const EntityDetails = ({ entity }: { entity: Entity }) => (
    <Card>
        <CardHeader>
            <CardTitle>Entity Details</CardTitle>
        </CardHeader>
        <CardContent>
            <p>
                <strong>Name:</strong> {entity.name}
            </p>
            <p>
                <strong>Phone:</strong> {entity.phone}
            </p>
            {entity.email && (
                <p>
                    <strong>Email:</strong> {entity.email}
                </p>
            )}
            {entity.description && (
                <p>
                    <strong>Description:</strong> {entity.description}
                </p>
            )}
        </CardContent>
    </Card>
);

const OrderItems = ({ items }: { items: OrderItem[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const OrderTransactions = ({ transactions }: { transactions: Transaction[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Order Transactions</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{transaction.account?.name}</TableCell>
                            <TableCell>{transaction.account?.type}</TableCell>
                            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                {new Date(transaction.createdAt).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const OrderSummary = ({ order }: { order: Order }) => {
    const totalPaid =
        order.transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
    const remainingToPay = order.totalAmount - totalPaid;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p>
                        <strong>Subtotal:</strong> ${order.baseAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Discount:</strong> ${order.discount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Tax:</strong> ${order.tax.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Paid:</strong> ${totalPaid.toFixed(2)}
                    </p>
                    <p className="text-lg font-semibold">
                        <strong>Remaining to Pay:</strong> ${remainingToPay.toFixed(2)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default SingleOrderPage;
