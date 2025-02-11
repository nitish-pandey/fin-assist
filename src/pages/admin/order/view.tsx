import { Order } from "@/data/types";
import { useOrg } from "@/providers/org-provider";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { OrderList } from "@/components/lists/Orders";
import { Link } from "react-router-dom";

const OrderViewPage = () => {
    const { orgId } = useOrg();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // getOrgOrders(orgId, token || "").then((data) => {
        //     setOrders(data);
        //     setLoading(false);
        // });
        api.get(`orgs/${orgId}/orders`).then((data) => {
            setOrders(data.data);
            setLoading(false);
        });
    }, [orgId]);

    return (
        <section className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
                <Link
                    to={"/org/" + orgId + "/orders/create"}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Create Order
                </Link>
            </div>
            {loading ? <p>Loading...</p> : <OrderList orders={orders} />}
        </section>
        // </div>
    );
};

export default OrderViewPage;
