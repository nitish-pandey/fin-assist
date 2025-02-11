import { useAuth } from "@/providers/auth-provider";
import { AddOrganizationForm } from "@/components/modals/AddOrganization";
import { OrganizationCard } from "@/components/cards/OrgCard";
import { PermissionsCard } from "@/components/cards/PermissionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleAccess } from "@/data/types";

export default function UserOrgs() {
    const { orgs, permissions } = useAuth();
    const groupedPermissions: Record<string, RoleAccess[]> = {};
    permissions?.forEach((perm) => {
        if (!groupedPermissions[perm.organizationId]) {
            groupedPermissions[perm.organizationId] = [];
        }
        groupedPermissions[perm.organizationId].push(perm);
    });

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-4xl font-bold text-primary">Your Dashboard</h1>
                <AddOrganizationForm />
            </header>

            <Tabs defaultValue="organizations" className="w-full max-w-4xl mx-auto py-10">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="organizations">Organizations</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="organizations" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {orgs?.map((org) => (
                            <OrganizationCard key={org.id} organization={org} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="permissions" className="mt-6">
                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([orgId, perms]) => (
                            <PermissionsCard key={orgId} orgId={orgId} permissions={perms} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
