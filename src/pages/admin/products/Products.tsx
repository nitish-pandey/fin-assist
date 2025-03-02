import { useParams } from "react-router-dom";
import { Product } from "@/data/types";
import { useEffect } from "react";
import { api } from "@/utils/api";
import { useState } from "react";
import { ProductList } from "@/components/lists/ProductList";
import CreateProduct from "@/components/forms/CreateProduct";

const OrgProducts = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await api.get(`orgs/${orgId}/products`);
            setProducts(data);
        };
        fetchProducts();
    }, [orgId]);

    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <div className="">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-gray-600">Manage your products here</p>
                </div>
                <CreateProduct orgId={orgId} />
            </div>
            <ProductList products={products} isLoading={false} error="" />
        </div>
    );
};

export default OrgProducts;
