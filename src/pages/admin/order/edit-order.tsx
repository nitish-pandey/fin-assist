"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Order, Entity, Account, Product } from "@/data/types";
import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";

import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditOrderForm from "@/components/forms/EditOrderForm";

interface EditOrderFormData {
    entity?: Entity | null;
    products: {
        productId: string;
        variantId: string;
        rate: number;
        quantity: number;
    }[];
    discount: number;
    charges: {
        id: string;
        amount: number;
        label: string;
        type: "fixed" | "percentage";
        percentage: number;
        bearedByEntity: boolean;
    }[];
    payments: { amount: number; accountId: string; details: object }[];
}

const EditOrderPage = () => {
    const { orgId } = useOrg();
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const parsedOrderData: EditOrderFormData | null = useMemo(() => {
        if (!order) return null;
        return {
            entity: entities.find((e) => e.id === order.entityId) || null,
            products:
                order.items?.map((p) => ({
                    variantId: p.productVariantId,
                    productId:
                        products.find((prod) =>
                            prod.variants?.some(
                                (v) => v.id === p.productVariantId
                            )
                        )?.id || "NA",
                    rate: p.price,
                    quantity: p.quantity,
                })) || [],
            discount: order.discount || 0,
            charges:
                order.charges?.map((c) => ({
                    id: c.id,
                    amount: c.amount,
                    label: c.label,
                    type: "fixed",
                    percentage: (c.amount / order.baseAmount) * 100 || 0,
                    bearedByEntity: c.bearedByEntity || false,
                })) || [],
            payments:
                order.transactions?.map((p) => ({
                    amount: p.amount,
                    accountId: p.accountId,
                    details: p.details || {},
                })) || [],
        };
    }, [order, entities, products]);

    useEffect(() => {
        if (!orgId) return;

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [products, accounts, entities, order] = await Promise.all(
                    [
                        api.get(`/orgs/${orgId}/products`),
                        api.get(`/orgs/${orgId}/accounts`),
                        api.get(`/orgs/${orgId}/entities`),
                        api.get(`/orgs/${orgId}/orders/${orderId}`),
                    ]
                ).then((responses) =>
                    responses.map((response) => response.data)
                );
                setProducts(products);
                setAccounts(accounts);
                setEntities(entities);
                setOrder(order);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [orgId]);

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const handleGoBack = () => {
        navigate(`/org/${orgId}/orders/all`);
    };

    if (error || !order) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || "Order not found. Please try again later."}
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={handleGoBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }
    const addEntity = async (entity: Partial<Entity>) => {
        try {
            const res = await api.post(`/orgs/${orgId}/entities`, entity);
            setEntities((prev) => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error("Error adding entity:", error);
            throw error;
        }
    };
    const onCreateOrder = async (data: object) => {
        try {
            const order = await api.put(
                `/orgs/${orgId}/orders/${orderId}`,
                data
            );
            navigate(`/org/${orgId}/orders/${order.data.id}`);
        } catch (err) {
            console.error("Error updating order:", err);
        }
    };

    return (
        <EditOrderForm
            type="BUY"
            products={products}
            entities={entities}
            accounts={accounts}
            onSubmit={onCreateOrder}
            addEntity={addEntity}
            initialData={parsedOrderData}
        />
    );
};

export default EditOrderPage;
