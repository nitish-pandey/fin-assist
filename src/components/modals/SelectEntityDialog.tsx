"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Entity } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface SelectEntityDialogProps {
    entities: Entity[];
    onSelectEntity: (entityId: string) => void;
}

const SelectEntityDialog: React.FC<SelectEntityDialogProps> = ({ entities, onSelectEntity }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEntities = useMemo(() => {
        return entities.filter((entity) =>
            entity.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [entities, searchTerm]);

    const groupedEntities = useMemo(() => {
        return filteredEntities.reduce((acc, entity) => {
            const firstLetter = entity.name[0].toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(entity);
            return acc;
        }, {} as Record<string, Entity[]>);
    }, [filteredEntities]);

    const handleSelectEntity = (entityId: string) => {
        onSelectEntity(entityId);
        setIsOpen(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} type="button">
                Select Entity
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select Entity</DialogTitle>
                    </DialogHeader>
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <ScrollArea className="h-[300px] pr-4">
                        {Object.entries(groupedEntities).map(([letter, entities]) => (
                            <div key={letter} className="mb-4">
                                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                    {letter}
                                </h3>
                                <div className="space-y-2">
                                    {entities.map((entity) => (
                                        <Button
                                            key={entity.id}
                                            type="button"
                                            onClick={() => handleSelectEntity(entity.id)}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            {entity.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SelectEntityDialog;
