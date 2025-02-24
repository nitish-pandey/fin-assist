import { useOrg } from "@/providers/org-provider";
import { useState, useEffect } from "react";
import { Account, Entity, Product } from "@/data/types";
import { api } from "@/utils/api";
import { CreateOrderForm } from "@/components/forms/CreateOrderForm";
export const SellOrderPage = () => {
    const { orgId } = useOrg();
    const [products, setProducts] = useState<Product[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId) return;

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [products, accounts, entities] = await Promise.all([
                    api.get(`/orgs/${orgId}/products`),
                    api.get(`/orgs/${orgId}/accounts`),
                    api.get(`/orgs/${orgId}/entities`),
                ]).then((responses) => responses.map((response) => response.data));
                setProducts(products);
                setAccounts(accounts);
                setEntities(entities);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [orgId]);

    const onCreateOrder = async (
        type: "BUY" | "SELL",
        products: { id: string; quantity: number }[],
        payments: { amount: number; accountId: string }[],
        entityId?: string
    ) => {
        try {
            const order = await api.post(`/orgs/${orgId}/orders`, {
                type,
                products,
                payments,
                entityId,
            });
            console.log("Order created successfully:", order);
        } catch (err) {
            console.error("Error creating order:", err);
        }
    };

    if (loading) {
        return <p className="text-center text-gray-600">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <section className="container mx-auto max-w-7xl px-6 py-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-700">Create Order</h1>
            </div>
            <CreateOrderForm
                products={products}
                entities={entities}
                accounts={accounts}
                onCreateOrder={onCreateOrder}
            />
        </section>
    );
};

export default SellOrderPage;
