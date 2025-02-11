import CategoryList from "@/components/lists/CategoryList";
import AddCategory from "@/components/modals/AddCategory";
import { Category } from "@/data/types";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrgCategories = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState<string | null>(null);

    const refetch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/orgs/${orgId}/category`);
            setCategories(data);
            setError(null);
        } catch (err) {
            setError("An error occurred while fetching categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const fetchCategories = async () => {
            try {
                const { data } = await api.get(`/orgs/${orgId}/category`);
                setCategories(data);
                setError(null);
            } catch (err) {
                setError("An error occurred while fetching categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [orgId]);

    const addCategory = async (name: string, description: string) => {
        await api.post(`/orgs/${orgId}/category`, { name, description });
        refetch();
    };

    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <AddCategory onAddCategory={addCategory} />
            </div>
            <CategoryList categories={categories} loading={loading} onRetry={() => {}} />
        </div>
    );
};

export default OrgCategories;
