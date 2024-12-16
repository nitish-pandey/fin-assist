"use client";

import * as React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useAuth } from "@/providers/ConfigProvider";
import { createOrganization } from "@/utils/api";
import Cookies from "universal-cookie";

export function AddOrganizationForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [orgName, setOrgName] = useState("");
    const { updateProfile } = useAuth();
    const cookie = new Cookies();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log("Creating organization:", orgName);
        setIsOpen(false);
        setOrgName("");
        await createOrganization({
            userId: cookie.get("userId"),
            token: cookie.get("token"),
            name: orgName,
        });
        updateProfile();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Organization
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Organization</DialogTitle>
                        <DialogDescription>
                            Enter the name for your new organization.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Organization</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
