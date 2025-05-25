import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Entity } from "@/data/types";
import { api } from "@/utils/api";
import EntityPage from "@/components/modules/SingleEntityDetails";
import { useOrg } from "@/providers/org-provider";

const SingleEntityPage = () => {
    const { entityId } = useParams<{ entityId: string }>();
    const { orgId } = useOrg();
    const [eneity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEntity = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api(`/orgs/${orgId}/entities/${entityId}`);
                setEntity(response.data);
                console.log("Entity fetched successfully:", response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching entity:", err);
                setError("Failed to load entity. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchEntity();
    }, [entityId]);

    if (loading) {
        return <p className="text-center text-gray-600">Loading...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }
    if (!eneity) {
        return <p className="text-center text-gray-600">Entity not found.</p>;
    }
    return (
        <div className="p-6 bg-white">
            <Link to={`/org/${orgId}/entity`} className="text-blue-600 hover:underline mb-4">
                &larr; Back to Entities
            </Link>
            <h1 className="text-3xl font-bold mb-4">Entity Details</h1>
            <EntityPage entity={eneity} />
        </div>
    );
};
export default SingleEntityPage;
