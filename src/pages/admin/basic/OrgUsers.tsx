import { useOrg } from "@/providers/org-provider";
import { useCallback, useEffect, useState } from "react";
import type { RoleAccess, Invite } from "@/data/types";
import { api } from "@/utils/api";
import UserAccessList from "@/components/lists/UsersAccessList";
import UserInviteList from "@/components/lists/UserInviteList";
import { Loader, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OrgUsers = () => {
    const { orgId } = useOrg();

    const [users, setUsers] = useState<RoleAccess[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const { access, invites } = (await api.get(`/orgs/${orgId}/users`)).data as {
                access: RoleAccess[];
                invites: Invite[];
            };
            setUsers(access);
            setInvites(invites);
        } catch (err) {
            setError("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        setError(null);

        try {
            const { access, invites } = (await api.get(`/orgs/${orgId}/users`)).data as {
                access: RoleAccess[];
                invites: Invite[];
            };
            setUsers(access);
            setInvites(invites);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    const inviteUser = async (email: string) => {
        try {
            await api.post(`/orgs/${orgId}/invite`, { email });
            refetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const removeInvite = async (inviteId: string) => {
        try {
            await api.delete(`/orgs/${orgId}/invite/${inviteId}`);
            refetchUsers();
        } catch (err) {
            setError("Failed to remove invite. Please try again.");
        }
    };

    const removeUser = async (userId: string) => {
        try {
            await api.delete(`/orgs/${orgId}/users/${userId}`);
            refetchUsers();
        } catch (err) {
            setError("Failed to remove user. Please try again.");
        }
    };

    return (
        <div>
            <div className="flex w-full items-center justify-between space-x-2 mb-4">
                <div className="">
                    <h2 className="text-xl font-semibold">Organization Users</h2>
                    <p>Manage users and invites for your organization</p>
                </div>

                <Button onClick={fetchUsers}>
                    Refresh Users
                    <RefreshCcw className="w-4 h-4 ml-2" />
                </Button>
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="mt-4">
                <UserAccessList access={users} removeUser={removeUser} inviteUser={inviteUser} />
                <UserInviteList invites={invites} removeInvite={removeInvite} />
            </div>
        </div>
    );
};

export default OrgUsers;
