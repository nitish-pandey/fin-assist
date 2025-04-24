"use client";

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
import { AddOrganizationForm } from "@/components/modals/AddOrganization";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoleAccess } from "@/data/types";
import { Link } from "react-router-dom";

export default function OrganizationsPage() {
    const { orgs, permissions } = useAuth();

    // Group permissions by organization ID
    const groupedPermissions: Record<string, RoleAccess[]> = {};
    permissions?.forEach((perm) => {
        if (!groupedPermissions[perm.organizationId]) {
            groupedPermissions[perm.organizationId] = [];
        }
        groupedPermissions[perm.organizationId].push(perm);
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage your organizations and access settings
                    </p>
                </div>
                <AddOrganizationForm />
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
