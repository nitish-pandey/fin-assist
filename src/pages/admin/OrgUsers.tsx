import UsersList from "../../components/lists/UsersList";
import { useParams } from "react-router-dom";
import { useAuth } from "../../providers/ConfigProvider";
import InviteUser from "../../components/forms/InviteUser";

const OrgUsers = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const { profile } = useAuth();
    const organization = profile?.organizations;
    const permissions = profile?.permissions;

    const canInviteUser =
        organization?.find((org) => org.id === orgId) ||
        permissions?.find(
            (perm) =>
                perm.organizationId === orgId && perm.access === "VIEW_USER"
        );

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-50 mb-4">
                    Org Users
                </h1>
                <div className="my-4">
                    {canInviteUser && <InviteUser orgId={orgId} />}
                </div>
            </div>
            <UsersList orgId={orgId} />
        </div>
    );
};

export default OrgUsers;
