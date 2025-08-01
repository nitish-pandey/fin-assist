import { api } from "@/utils/api";
import { useState, useEffect } from "react";
import { Entity } from "@/data/types";
import { useParams } from "react-router-dom";
import { EntityList } from "@/components/lists/EntityList";
import AddEntity from "@/components/modals/AddEntity";
import { TableSkeleton } from "@/components/modules/TableSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EntityInfo = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orgId) {
            setLoading(true);
            api.get(`/orgs/${orgId}/entities`)
                .then((res) => {
                    console.log("Fetched entities:", res.data);
                    setEntities(res.data ?? []);
                })
                .catch((error) => {
                    console.error("Failed to fetch entities:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [orgId]);

    const handleDelete = async (id: string) => {
        await api.delete(`/orgs/${orgId}/entities/${id}`);
        setEntities(entities.filter((entity) => entity.id !== id));
    };

    const addEntity = async (entity: Partial<Entity>) => {
        const createdEntity = await api.post(`/orgs/${orgId}/entities`, entity);
        setEntities([...entities, createdEntity.data]);
    };

    const updateEntity = async (id: string, entity: Partial<Entity>) => {
        await api.put(`/orgs/${orgId}/entities/${id}`, entity);
        setEntities(
            entities.map((e) => (e.id === id ? { ...e, ...entity } : e))
        );
    };

    return (
        <div className="w-full mx-auto">
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-3xl font-bold">Entities</h2>
                <AddEntity addEntity={addEntity} />
            </div>

            <div className=" mt-8">
                {loading ? (
                    <TableSkeleton rows={5} columns={4} />
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All Entities</TabsTrigger>
                            <TabsTrigger value="merchant">
                                Merchant Entities
                            </TabsTrigger>
                            <TabsTrigger value="vendor">
                                Vendor Entities
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                            <EntityList
                                entities={entities}
                                loading={false}
                                error={null}
                                onDelete={handleDelete}
                                onEdit={updateEntity}
                            />
                        </TabsContent>

                        <TabsContent value="merchant" className="mt-6">
                            <EntityList
                                entities={entities.filter(
                                    (entity) => entity.isMerchant
                                )}
                                loading={false}
                                error={null}
                                onDelete={handleDelete}
                                onEdit={updateEntity}
                            />
                        </TabsContent>

                        <TabsContent value="vendor" className="mt-6">
                            <EntityList
                                entities={entities.filter(
                                    (entity) => entity.isVendor
                                )}
                                loading={false}
                                error={null}
                                onDelete={handleDelete}
                                onEdit={updateEntity}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default EntityInfo;
