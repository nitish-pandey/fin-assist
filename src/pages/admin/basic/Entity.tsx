import { api } from "@/utils/api";
import { useState, useEffect } from "react";
import { Entity } from "@/data/types";
import { useParams } from "react-router-dom";
import { EntityList } from "@/components/lists/EntityList";
import AddEntity from "@/components/modals/AddEntity";

const EntityInfo = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [entities, setEntities] = useState<Entity[]>([]);

    const fetchEntities = async () => {
        const res = await api.get(`/orgs/${orgId}/entities`);
        setEntities(res.data);
    };

    useEffect(() => {
        if (orgId) {
            api.get(`/orgs/${orgId}/entities`).then((res) => {
                setEntities(res.data);
            });
        }
    }, [orgId]);

    const handleDelete = async (id: string) => {
        await api.delete(`/orgs/${orgId}/entities/${id}`);
        fetchEntities();
    };

    const addEntity = async (entity: Partial<Entity>) => {
        await api.post(`/orgs/${orgId}/entities`, entity);
        fetchEntities();
    };

    const updateEntity = async (id: string, entity: Partial<Entity>) => {
        await api.put(`/orgs/${orgId}/entities/${id}`, entity);
        fetchEntities();
    };

    return (
        <div className="w-full mx-auto">
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-3xl font-bold">Entities</h2>
                <AddEntity addEntity={addEntity} />
            </div>

            <div className=" mt-8">
                <EntityList
                    entities={entities}
                    loading={false}
                    error={null}
                    onDelete={handleDelete}
                    onEdit={updateEntity}
                />
            </div>
        </div>
    );
};

export default EntityInfo;
