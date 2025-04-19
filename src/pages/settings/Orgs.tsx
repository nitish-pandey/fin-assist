"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { Organization, RoleAccess } from "@/data/types";
import { Link } from "react-router-dom";

export default function OrganizationsPage() {
    const { orgs, permissions } = useAuth();
    const [newOrg, setNewOrg] = useState<Partial<Organization>>({
        name: "",
        description: "",
        contact: "",
        domain: "",
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Group permissions by organization ID
    const groupedPermissions: Record<string, RoleAccess[]> = {};
    permissions?.forEach((perm) => {
        if (!groupedPermissions[perm.organizationId]) {
            groupedPermissions[perm.organizationId] = [];
        }
        groupedPermissions[perm.organizationId].push(perm);
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewOrg((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // In a real app, you would submit this to your API
        console.log("Creating new organization:", newOrg);

        setNewOrg({
            name: "",
            description: "",
            contact: "",
            domain: "",
        });
        setIsDialogOpen(false);

        toast({
            title: "Organization created",
            description: `${newOrg.name} has been created successfully.`,
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage your organizations and access settings
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                            <DialogDescription>
                                Add a new organization to your account
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Organization Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={newOrg.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={newOrg.description || ""}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact">Contact Email</Label>
                                        <Input
                                            id="contact"
                                            name="contact"
                                            type="email"
                                            value={newOrg.contact || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">Domain</Label>
                                        <Input
                                            id="domain"
                                            name="domain"
                                            value={newOrg.domain || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Organization</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="organizations" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="organizations">Organizations</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="organizations">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {orgs?.map((org) => (
                            <Card key={org.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center">
                                        <CardTitle className="text-lg">{org.name}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {org.description || "No description provided"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2 text-sm">
                                        {org.contact && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Contact:</span>
                                                <span>{org.contact}</span>
                                            </div>
                                        )}
                                        {org.domain && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Domain:</span>
                                                <span>{org.domain}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Created:</span>
                                            <span>
                                                {new Date(org.createdAt || "").toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Link to={`/org/${org.id}/dashboard`} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <Building2 className="mr-2 h-4 w-4" />
                                            Access Organization
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="permissions">
                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([orgId, perms]) => {
                            const org = orgs?.find((o) => o.id === orgId);
                            return (
                                <Card key={orgId}>
                                    <CardHeader>
                                        <CardTitle>{org?.name || "Organization"}</CardTitle>
                                        <CardDescription>
                                            Your access permissions for this organization
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {perms.map((perm) => (
                                                <div
                                                    key={perm.id}
                                                    className="flex items-center justify-between p-2 border rounded-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {perm.access}
                                                        </Badge>
                                                        <span>
                                                            {getAccessDescription(perm.access)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function getAccessDescription(access: string) {
    switch (access) {
        case "ORG":
            return "Organization Management";
        case "ACCOUNT":
            return "Account Management";
        case "PRODUCT":
            return "Product Management";
        case "ENTITY":
            return "Entity Management";
        case "ORDER":
            return "Order Management";
        default:
            return "Unknown Access";
    }
}
