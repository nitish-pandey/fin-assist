import UsersList from "../../components/lists/UsersList";
import { useParams } from "react-router-dom";
import { useGlobalContext } from "../../providers/ConfigProvider";
import InviteUser from "../../components/forms/InviteUser";

const OrgUsers = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const { permissions, organization } = useGlobalContext();
    const canInviteUser =
        organization?.find((org) => org.id === orgId) ||
        permissions?.find(
            (perm) =>
                perm.organizationId === orgId && perm.access === "MANAGE_USERS"
        );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                Org Users
            </h1>
            <UsersList orgId="1" />
            <div className="my-4">
                {canInviteUser && <InviteUser orgId={orgId} />}
            </div>
        </div>
    );
};

export default OrgUsers;
