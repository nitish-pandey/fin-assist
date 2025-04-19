import { useCallback, useState } from "react";
import useSWR from "swr";
import { useOrg } from "@/providers/org-provider";
import type { RoleAccess, Invite } from "@/data/types";
import { api } from "@/utils/api";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Shield,
    UserPlus,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserAccessList from "@/components/lists/UsersAccessList";
import UserInviteList from "@/components/lists/UserInviteList";
import { toast } from "@/hooks/use-toast";

const fetcher = async (url: string) => {
    const response = await api.get(url);
    return response.data;
};

export default function OrgUsers() {
    const { orgId } = useOrg();
    const [activeTab, setActiveTab] = useState<string>("members");

    // Use SWR for data fetching with automatic revalidation
    const {
        data,
        error: fetchError,
        isLoading,
        mutate,
    } = useSWR<{ access: RoleAccess[]; invites: Invite[] }>(
        orgId ? `/orgs/${orgId}/users` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    const [, setActionInProgress] = useState<string | null>(null);

    const inviteUser = useCallback(
        async (email: string) => {
            if (!orgId) return;

            setActionInProgress(`invite-${email}`);
            try {
                await api.post(`/orgs/${orgId}/invite`, { email });
                await mutate();
                toast({
                    title: "Invitation sent",
                    description: `Successfully invited ${email} to the organization`,
                    variant: "default",
                });
            } catch (err) {
                toast({
                    title: "Failed to send invitation",
                    description: "Please try again later",
                    variant: "destructive",
                });
            } finally {
                setActionInProgress(null);
            }
        },
        [orgId, mutate]
    );

    const removeInvite = useCallback(
        async (inviteId: string) => {
            if (!orgId) return;

            setActionInProgress(`remove-invite-${inviteId}`);
            try {
                await api.delete(`/orgs/${orgId}/invite/${inviteId}`);
                await mutate();
                toast({
                    title: "Invite removed",
                    description: "The invitation has been successfully canceled",
                    variant: "default",
                });
            } catch (err) {
                toast({
                    title: "Failed to remove invite",
                    description: "Please try again later",
                    variant: "destructive",
                });
            } finally {
                setActionInProgress(null);
            }
        },
        [orgId, mutate]
    );

    const removeUser = useCallback(
        async (userId: string) => {
            if (!orgId) return;

            setActionInProgress(`remove-user-${userId}`);
            try {
                await api.delete(`/orgs/${orgId}/users/${userId}`);
                await mutate();
                toast({
                    title: "User removed",
                    description: "The user has been removed from the organization",
                    variant: "default",
                });
            } catch (err) {
                toast({
                    title: "Failed to remove user",
                    description: "Please try again later",
                    variant: "destructive",
                });
            } finally {
                setActionInProgress(null);
            }
        },
        [orgId, mutate]
    );

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organization Users</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage team members and pending invitations
                    </p>
                </div>

                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="self-start sm:self-auto"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                </Button>
            </div>

            {fetchError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load organization users. Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Team Management
                            </CardTitle>
                            <CardDescription>
                                Invite new members and manage existing team access
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                                {data?.access?.length || 0} Members
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {data?.invites?.length || 0} Pending
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                            <TabsTrigger value="members" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Members</span>
                            </TabsTrigger>
                            <TabsTrigger value="invites" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span>Invitations</span>
                                {data?.invites && data.invites.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {data.invites.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="members" className="mt-0">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 border rounded-md"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-[200px]" />
                                                    <Skeleton className="h-3 w-[150px]" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-9 w-[100px]" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <UserAccessList
                                    access={data?.access || []}
                                    removeUser={removeUser}
                                    inviteUser={inviteUser}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="invites" className="mt-0">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 border rounded-md"
                                        >
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-3 w-[180px]" />
                                            </div>
                                            <Skeleton className="h-9 w-[100px]" />
                                        </div>
                                    ))}
                                </div>
                            ) : data?.invites?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No pending invitations</h3>
                                    <p className="text-muted-foreground mt-1 max-w-md">
                                        When you invite new team members, they'll appear here until
                                        they accept
                                    </p>
                                </div>
                            ) : (
                                <UserInviteList
                                    invites={data?.invites || []}
                                    removeInvite={removeInvite}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
