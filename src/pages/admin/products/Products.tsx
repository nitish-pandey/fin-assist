import { Link, useParams } from "react-router-dom";
import { Product } from "@/data/types";
import { useEffect } from "react";
import { api } from "@/utils/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductList } from "@/components/lists/ProductList";

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
                <h1 className="text-2xl font-bold mb-8">Products</h1>
                <Link to={`/org/${orgId}/products/create`}>
                    <Button>
                        <Plus size={16} className="mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>
            <ProductList products={products} isLoading={false} error="" />
        </div>
    );
};

export default OrgProducts;
