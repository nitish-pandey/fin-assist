"use client";

import React, { useMemo } from "react";
import { Building, Mail, Globe, CreditCard, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Organization } from "@/data/types";
import { api } from "@/utils/api";
import EditOrgModal from "@/components/modals/EditOrgInfo";
import { useOrg } from "@/providers/org-provider";
import { RemoveModal } from "@/components/modals/RemoveModal";
import { FaAddressBook } from "react-icons/fa";

export default function OrgInfoPage() {
    const { orgId, refetch, organization } = useOrg();

    const timeFormatted = useMemo(() => {
        if (!organization?.createdAt) return "N/A";
        return formatTimeAgo(organization.createdAt);
    }, [organization?.createdAt]);

    if (!organization) return <LoadingState />;

    const handleEditSubmit = async (updatedData: Partial<Organization>) => {
        try {
            await api.put(`/orgs/${orgId}`, {
                ...organization,
                ...updatedData,
            });
            refetch();
        } catch (error) {
            console.error("Failed to update organization:", error);
        }
    };

    const handleDeleteOrganization = async () => {
        await api.delete(`/orgs/${orgId}`);
        window.location.href = "/profile";
    };

    return (
        <div className="bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 rounded-xl shadow-sm border-2 border-gray-100">
                                <AvatarImage
                                    src={organization.logo || undefined}
                                    alt={`${organization.name} logo`}
                                />
                                <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-semibold rounded-xl">
                                    {organization.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        {organization.name}
                                    </h1>
                                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span>{organization.domain || "No domain"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Created {timeFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:ml-auto flex items-center gap-4">
                            <EditOrgModal orgData={organization} onSubmit={handleEditSubmit} />
                            <RemoveModal
                                title="Delete Organization"
                                description="Are you sure you want to delete this organization?"
                                onRemove={handleDeleteOrganization}
                                text="Delete"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Organization Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Organization Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoField
                                    icon={Building}
                                    label="Organization Name"
                                    value={organization.name}
                                    iconColor="text-blue-600"
                                />
                                <InfoField
                                    icon={FaAddressBook}
                                    label="Address"
                                    value={organization.description}
                                    iconColor="text-teal-600"
                                />
                                <InfoField
                                    icon={Mail}
                                    label="Contact"
                                    value={organization.contact}
                                    iconColor="text-emerald-600"
                                />
                                <InfoField
                                    icon={Mail}
                                    label="Inventory Increment Rate"
                                    value={
                                        organization.depreciationRate
                                            ? `${organization.depreciationRate}%`
                                            : null
                                    }
                                    iconColor="text-emerald-600"
                                />
                                <InfoField
                                    icon={Globe}
                                    label="Domain"
                                    value={organization.domain}
                                    iconColor="text-purple-600"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tax Information */}
                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Tax Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoField
                                    icon={CreditCard}
                                    label="PAN"
                                    value={organization.pan}
                                    iconColor="text-amber-600"
                                />
                            </CardContent>
                        </Card>

                        {/* Timestamps */}
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Created</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(organization.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Last Updated
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(organization.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Optimized component for displaying organization information fields
const InfoField = ({
    icon: Icon,
    label,
    value,
    iconColor = "text-gray-600",
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    iconColor?: string;
}) => (
    <div className="flex items-start gap-3 py-3">
        <div className="mt-0.5">
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-sm text-gray-900 mt-0.5 break-words">
                {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
        </div>
    </div>
);

// Loading state with improved skeleton design
const LoadingState = () => (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
            <Card className="border-gray-200 shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-xl" />
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-6">
                            <Skeleton className="h-6 w-48 mb-6" />
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex gap-3 py-3">
                                        <Skeleton className="h-4 w-4 mt-0.5" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-6">
                            <Skeleton className="h-6 w-32 mb-6" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-3 py-3">
                                        <Skeleton className="h-4 w-4 mt-0.5" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-6">
                            <Skeleton className="h-6 w-24 mb-6" />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);

// Utility functions for date formatting
const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Invalid date";
    }
};

const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;

        return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    } catch {
        return "Invalid date";
    }
};
