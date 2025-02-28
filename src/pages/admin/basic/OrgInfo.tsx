"use client";

import React from "react";
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

    if (!organization) return <ErrorMessage />;

    const onEditSubmit = async (updatedData: Partial<Organization>) => {
        await api.put(`/orgs/${orgId}`, { ...organization, ...updatedData });
        refetch();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <Card className="w-full max-w-4xl shadow-xl border rounded-xl">
                <CardHeader className="bg-primary text-primary-foreground flex flex-row justify-between items-center p-5 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <Building className="h-7 w-7" />
                        <CardTitle className="text-2xl font-semibold">
                            {organization.name}
                        </CardTitle>
                    </div>
                    <EditOrgModal orgData={organization} onSubmit={onEditSubmit} />
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem icon={Mail} label="Contact" value={organization.contact} />
                    <InfoItem icon={Globe} label="Domain" value={organization.domain} />
                    <InfoItem icon={CreditCard} label="PAN" value={organization.pan} />
                    <InfoItem icon={CreditCard} label="VAT" value={organization.vat} />
                    <InfoItem icon={User} label="Owner ID" value={organization.ownerId} />
                    <InfoItem
                        icon={Calendar}
                        label="Created At"
                        value={formatDate(organization.createdAt)}
                    />
                    <InfoItem
                        icon={Calendar}
                        label="Updated At"
                        value={formatDate(organization.updatedAt)}
                    />
                </CardContent>
                {organization.logo && (
                    <div className="flex justify-center py-6">
                        <Avatar className="h-32 w-32 border-4 border-primary shadow-md rounded-full">
                            <AvatarImage
                                src={organization.logo}
                                alt={`${organization.name} logo`}
                            />
                            <AvatarFallback>
                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                )}
            </Card>
        </div>
    );
}

const InfoItem = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
}) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="bg-primary/10 p-2 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-base font-semibold text-gray-900">{value || "N/A"}</p>
        </div>
    </div>
);

const ErrorMessage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Card className="max-w-md w-full shadow-lg border rounded-lg">
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

const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";
