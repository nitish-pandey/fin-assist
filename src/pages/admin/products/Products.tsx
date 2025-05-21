import { Link, useParams } from "react-router-dom";
import { Product } from "@/data/types";
import { useEffect } from "react";
import { api } from "@/utils/api";
import { useState } from "react";
import { ProductList } from "@/components/lists/ProductList";
// import CreateProduct from "@/components/forms/CreateProduct";

const OrgProducts = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            const { data } = await api.get(`orgs/${orgId}/products`);
            setProducts(data);
        };
        fetchProducts();
        setLoading(false);
    }, [orgId]);

    // const handleProductCreated = (newProduct: Product) => {
    //     setProducts((prevProducts) => [...prevProducts, newProduct]);
    // };

    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <div className="">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-gray-600">Manage your products here</p>
                </div>
                <Link
                    to={`/org/${orgId}/products/create`}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Create Product
                </Link>
                {/* <CreateProduct orgId={orgId} afterCreate={handleProductCreated} /> */}
            </div>
            <ProductList products={products} isLoading={loading} error="" />
        </div>
    );
};

export default OrgProducts;
