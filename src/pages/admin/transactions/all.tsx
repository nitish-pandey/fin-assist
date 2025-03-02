import { Order } from "@/data/types";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";
import { OrderList } from "@/components/lists/Orders";

export default function AllTransactionPage() {
    const { orgId } = useOrg();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`orgs/${orgId}/orders`).then((data) => {
            setOrders(data.data);
            setLoading(false);
        });
    }, [orgId]);

    return (
        <section className="container mx-auto px-6 py-8 max-w-7xl">
            <h1 className="text-lg font-semibold text-gray-700 mb-8">Orders</h1>
            {loading ? <p>Loading...</p> : <OrderList orders={orders} />}
        </section>
    );
}
