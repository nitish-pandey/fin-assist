"use client";

import type React from "react";
import { useState, useMemo } from "react";

import type { Entity } from "@/data/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddEntity from "../modals/AddEntity";
import { useToast } from "@/hooks/use-toast";
import { useOrg } from "@/providers/org-provider";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntitySelectorProps {
    entities: Entity[];
    selectedEntity?: Entity | null;
    onSelectEntity: (entity: Entity) => void;
    onAddEntity: (entity: Partial<Entity>) => Promise<void>;
    error?: string | null;
    type?: "merchant" | "vendor" | "both";
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
    entities,
    selectedEntity,
    onSelectEntity,
    onAddEntity,
    error,
    type = "both",
}) => {
    const { orgId } = useOrg();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Filter entities based on search value
    const filteredEntities = useMemo(() => {
        if (!searchValue) return entities;
        return entities.filter(
            (entity) =>
                entity.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                entity.email
                    ?.toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                entity.phone?.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [entities, searchValue]);

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

    const handleSelectEntity = (entityId: string) => {
        const entity = entities.find((e) => e.id === entityId);
        if (entity) {
            onSelectEntity(entity);
            setOpen(false);
            setSearchValue("");
        }
    };

    return (
        <Card className="bg-gray-100 border-0 shadow-none">
            <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Basic Information
                </CardTitle>
                <p className="text-sm text-gray-500">
                    Add information of client
                </p>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="entity"
                            className="text-sm font-medium text-gray-700"
                        >
                            Search Entity/Party
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between bg-white border-0 shadow-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                                        >
                                            {selectedEntity ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate">
                                                        {selectedEntity.name}
                                                    </span>
                                                    {selectedEntity.email && (
                                                        <span className="text-sm text-muted-foreground">
                                                            (
                                                            {
                                                                selectedEntity.email
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                "Select entity..."
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[400px] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder="Search entities..."
                                                value={searchValue}
                                                onValueChange={setSearchValue}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No entities found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredEntities.map(
                                                        (entity) => (
                                                            <CommandItem
                                                                key={entity.id}
                                                                value={
                                                                    entity.id
                                                                }
                                                                onSelect={() =>
                                                                    handleSelectEntity(
                                                                        entity.id
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">
                                                                            {
                                                                                entity.name
                                                                            }
                                                                        </span>
                                                                        {entity.email && (
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {
                                                                                    entity.email
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        {entity.phone && (
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {
                                                                                    entity.phone
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto h-4 w-4",
                                                                            selectedEntity?.id ===
                                                                                entity.id
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <AddEntity
                                addEntity={addEntity}
                                text="Add New"
                                type={type}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="address"
                            className="text-sm font-medium text-gray-700"
                        >
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
                        <Label
                            htmlFor="phone"
                            className="text-sm font-medium text-gray-700"
                        >
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
                        <Label
                            htmlFor="fieldName"
                            className="text-sm font-medium text-gray-700"
                        >
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
