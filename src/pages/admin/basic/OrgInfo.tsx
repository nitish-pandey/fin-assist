"use client";

import type React from "react";

import { useState } from "react";
import {
    Building,
    Mail,
    Globe,
    User,
    CreditCard,
    Edit,
    Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Organization } from "@/data/types";
import { api } from "@/utils/api";
import EditOrgModal from "@/components/modals/EditOrgInfo";
import { useOrg } from "@/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrgInfoPage() {
    const { orgId, refetch, organization } = useOrg();
    const [activeTab, setActiveTab] = useState("overview");

    if (!organization) return <ErrorState />;

    const onEditSubmit = async (updatedData: Partial<Organization>) => {
        await api.put(`/orgs/${orgId}`, { ...organization, ...updatedData });
        refetch();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-xl">
                                <AvatarImage
                                    src={organization.logo || undefined}
                                    alt={`${organization.name} logo`}
                                />
                                <AvatarFallback className="bg-primary/10">
                                    <Building className="h-12 w-12 text-primary" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        {organization.name}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary border-primary/20"
                                    >
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-slate-500">
                                    <Globe className="h-4 w-4" />
                                    <span>
                                        {organization.domain || "No domain"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Created{" "}
                                        {formatTimeAgo(organization.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <EditOrgModal
                                orgData={organization}
                                onSubmit={onEditSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs
                    defaultValue="overview"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="col-span-2">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-slate-900">
                                        Organization Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoCard
                                            icon={Building}
                                            label="Organization Name"
                                            value={organization.name}
                                            iconColor="text-emerald-500"
                                            bgColor="bg-emerald-50"
                                        />
                                        <InfoCard
                                            icon={Mail}
                                            label="Contact Email"
                                            value={organization.contact}
                                            iconColor="text-blue-500"
                                            bgColor="bg-blue-50"
                                        />
                                        <InfoCard
                                            icon={Globe}
                                            label="Domain"
                                            value={organization.domain}
                                            iconColor="text-indigo-500"
                                            bgColor="bg-indigo-50"
                                        />
                                        <InfoCard
                                            icon={User}
                                            label="Owner ID"
                                            value={organization.ownerId}
                                            iconColor="text-violet-500"
                                            bgColor="bg-violet-50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-slate-900">
                                        Tax Information
                                    </h2>
                                    <div className="space-y-4">
                                        <InfoCard
                                            icon={CreditCard}
                                            label="PAN"
                                            value={organization.pan}
                                            iconColor="text-amber-500"
                                            bgColor="bg-amber-50"
                                        />
                                        <InfoCard
                                            icon={CreditCard}
                                            label="VAT"
                                            value={organization.vat}
                                            iconColor="text-rose-500"
                                            bgColor="bg-rose-50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                                    Timeline
                                </h2>
                                <div className="space-y-6">
                                    <TimelineItem
                                        title="Organization Created"
                                        date={organization.createdAt}
                                        icon={Building}
                                        iconColor="text-green-500"
                                        bgColor="bg-green-50"
                                    />
                                    <TimelineItem
                                        title="Last Updated"
                                        date={organization.updatedAt}
                                        icon={Edit}
                                        iconColor="text-blue-500"
                                        bgColor="bg-blue-50"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-6 text-slate-900">
                                    Detailed Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 text-slate-800">
                                            Organization Details
                                        </h3>
                                        <div className="space-y-4">
                                            <DetailItem
                                                label="Name"
                                                value={organization.name}
                                            />
                                            <DetailItem
                                                label="Contact"
                                                value={organization.contact}
                                            />
                                            <DetailItem
                                                label="Domain"
                                                value={organization.domain}
                                            />
                                            <DetailItem
                                                label="Owner ID"
                                                value={organization.ownerId}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 text-slate-800">
                                            Tax Information
                                        </h3>
                                        <div className="space-y-4">
                                            <DetailItem
                                                label="PAN"
                                                value={organization.pan}
                                            />
                                            <DetailItem
                                                label="VAT"
                                                value={organization.vat}
                                            />
                                        </div>

                                        <h3 className="text-lg font-medium mt-8 mb-4 text-slate-800">
                                            Timestamps
                                        </h3>
                                        <div className="space-y-4">
                                            <DetailItem
                                                label="Created At"
                                                value={formatDate(
                                                    organization.createdAt
                                                )}
                                            />
                                            <DetailItem
                                                label="Updated At"
                                                value={formatDate(
                                                    organization.updatedAt
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-6 text-slate-900">
                                    Organization History
                                </h2>
                                <div className="space-y-6">
                                    <HistoryItem
                                        action="Organization Created"
                                        date={organization.createdAt}
                                        user="System"
                                        details="Initial organization setup"
                                    />
                                    <HistoryItem
                                        action="Information Updated"
                                        date={organization.updatedAt}
                                        user="Admin"
                                        details="Organization information was updated"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const InfoCard = ({
    icon: Icon,
    label,
    value,
    iconColor = "text-primary",
    bgColor = "bg-primary/10",
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    iconColor?: string;
    bgColor?: string;
}) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1">
                {value || "N/A"}
            </p>
        </div>
    </div>
);

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-900 mt-1">
            {value || "N/A"}
        </p>
        <Separator className="mt-3" />
    </div>
);

const TimelineItem = ({
    title,
    date,
    icon: Icon,
    iconColor = "text-primary",
    bgColor = "bg-primary/10",
}: {
    title: string;
    date?: string;
    icon: React.ElementType;
    iconColor?: string;
    bgColor?: string;
}) => (
    <div className="flex items-start gap-4">
        <div className={`${bgColor} p-3 rounded-full shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
            <p className="font-medium text-slate-900">{title}</p>
            <p className="text-sm text-slate-500 mt-1">{formatDate(date)}</p>
        </div>
    </div>
);

const HistoryItem = ({
    action,
    date,
    user,
    details,
}: {
    action: string;
    date?: string;
    user: string;
    details: string;
}) => (
    <div className="border-l-2 border-slate-200 pl-6 pb-2 relative">
        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
        <p className="font-medium text-slate-900">{action}</p>
        <p className="text-sm text-slate-500 mt-1">{formatDate(date)}</p>
        <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
                {user}
            </Badge>
            <p className="text-sm text-slate-600">{details}</p>
        </div>
    </div>
);

const ErrorState = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full shadow-lg border rounded-lg overflow-hidden">
            <div className="bg-red-50 p-6 flex flex-col items-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                    <Building className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">
                    Organization Not Found
                </h2>
                <p className="text-center text-red-600">
                    We couldn't retrieve the organization details at this time.
                </p>
            </div>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Button className="w-full" variant="outline">
                        Try Again
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
);

const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
        return `${Math.floor(diffInSeconds / 2592000)} months ago`;

    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
