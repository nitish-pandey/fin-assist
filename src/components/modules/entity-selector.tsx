"use client";

import type React from "react";

import type { Entity } from "@/data/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddEntity from "../modals/AddEntity";
import { useToast } from "@/hooks/use-toast";
import { useOrg } from "@/providers/org-provider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EntitySelectorProps {
    entities: Entity[];
    selectedEntity?: Entity | null;
    onSelectEntity: (entity: Entity) => void;
    onAddEntity: (entity: Partial<Entity>) => Promise<void>;
    error?: string | null;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
    entities,
    selectedEntity,
    onSelectEntity,
    onAddEntity,
    error,
}) => {
    const { orgId } = useOrg();
    const { toast } = useToast();

    const addEntity = async (entity: Partial<Entity>) => {
        if (!orgId) return;
        try {
            await onAddEntity(entity);
            toast({
                title: "Entity added",
                description: "The entity has been added successfully.",
            });
        } catch (error) {
            toast({
                title: "Error adding entity",
                description: "There was an error adding the entity.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="bg-gray-100 border-0 shadow-none">
            <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Basic Information
                </CardTitle>
                <p className="text-sm text-gray-500">Add information of client</p>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="entity" className="text-sm font-medium text-gray-700">
                            Search Entity
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Select
                                    value={selectedEntity?.id || ""}
                                    onValueChange={(value) => {
                                        const entity = entities.find((e) => e.id === value);
                                        if (entity) {
                                            onSelectEntity(entity);
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        id="entity"
                                        className="w-full bg-white border-0 shadow-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                                    >
                                        <SelectValue placeholder="Select entity..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="select">Select an entity</SelectItem>
                                        {entities.map((entity) => (
                                            <SelectItem key={entity.id} value={entity.id}>
                                                {entity.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <AddEntity addEntity={addEntity} text="Add New" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                            Email
                        </Label>
                        <Input
                            id="address"
                            placeholder="Enter address"
                            className="bg-white border-0 shadow-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                            value={selectedEntity?.email || ""}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            placeholder="Enter phone number"
                            className="bg-white border-0 shadow-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                            value={selectedEntity?.phone || ""}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fieldName" className="text-sm font-medium text-gray-700">
                            Description
                        </Label>
                        <Input
                            id="fieldName"
                            placeholder="Enter Description"
                            className="bg-white border-0 shadow-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                            value={selectedEntity?.description || ""}
                            readOnly
                        />
                    </div>
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-4 p-2 bg-red-50 border border-red-100 rounded">
                        {error}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default EntitySelector;
