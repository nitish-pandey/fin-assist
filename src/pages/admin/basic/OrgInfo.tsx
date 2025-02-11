"use client";

import React, { useEffect, useState } from "react";
import {
    Building,
    Mail,
    Globe,
    User,
    CreditCard,
    Calendar,
    ImageIcon,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Organization } from "@/data/types";
import { api } from "@/utils/api";
import EditOrgModal from "@/components/modals/EditOrgInfo";
import { useOrg } from "@/providers/org-provider";

export default function OrgInfoPage() {
    const { orgId, refetch, organization } = useOrg();

    if (!organization) {
        return <ErrorMessage />;
    }
    const onEditSubmit = async ({ name, contact, pan, vat, domain }: Partial<Organization>) => {
        await api.put(`/orgs/${orgId}`, {
            name,
            contact,
            pan,
            vat,
            domain,
            description: organization.description,
        });
        refetch();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-6">
                    <h1 className="text-3xl font-bold text-gray-900">Organization Info</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 px-6">
                <Card className="shadow-lg border">
                    <CardHeader className="bg-primary text-primary-foreground flex flex-row justify-between items-center p-4">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            {organization.name}
                        </CardTitle>
                        <EditOrgModal orgData={organization} onSubmit={onEditSubmit} />
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <InfoItem icon={Building} label="Name" value={organization.name} />
                            <InfoItem
                                icon={Mail}
                                label="Contact"
                                value={organization.contact || "N/A"}
                            />
                            <InfoItem
                                icon={Globe}
                                label="Domain"
                                value={organization.domain || "N/A"}
                            />
                            <InfoItem
                                icon={CreditCard}
                                label="PAN"
                                value={organization.pan || "N/A"}
                            />
                        </div>
                        <div className="space-y-4">
                            <InfoItem
                                icon={CreditCard}
                                label="VAT"
                                value={organization.vat || "N/A"}
                            />
                            <InfoItem icon={User} label="Owner ID" value={organization.ownerId} />
                            <InfoItem
                                icon={Calendar}
                                label="Created At"
                                value={new Date(organization.createdAt || "").toLocaleString()}
                            />
                            <InfoItem
                                icon={Calendar}
                                label="Updated At"
                                value={new Date(organization.updatedAt || "").toLocaleString()}
                            />
                        </div>
                    </CardContent>
                    {organization.logo && (
                        <div className="flex justify-center mt-6">
                            <Avatar className="h-40 w-40 border-4 border-primary shadow-lg">
                                <AvatarImage
                                    src={organization.logo}
                                    alt={`${organization.name} logo`}
                                />
                                <AvatarFallback>
                                    <ImageIcon className="h-20 w-20 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}

const LoadingSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-lg font-medium text-gray-600">
                Loading organization details...
            </p>
        </div>
    </div>
);

const ErrorMessage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full shadow-lg border">
            <CardHeader>
                <CardTitle className="text-center text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center">
                    An error occurred while fetching organization details. Please try again later.
                </p>
            </CardContent>
        </Card>
    </div>
);

const InfoItem = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string;
}) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-primary/10 p-2 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-base font-semibold text-gray-900">{value || "N/A"}</p>
        </div>
    </div>
);
