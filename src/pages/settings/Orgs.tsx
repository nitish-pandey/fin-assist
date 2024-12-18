import { Link } from "react-router-dom";
import { useAuth } from "../../providers/ConfigProvider";
import { FaBuilding, FaUserShield, FaChevronRight } from "react-icons/fa";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { RoleAccessSchema } from "../../data/types";
import { AddOrganizationForm } from "@/components/modals/AddOrganization";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/utils/api";

const UserOrgs = () => {
    const { profile, organizations, permissions } = useAuth();
    const invites = profile?.invites;

    // group permissions by organization
    const groupedPermissions: Record<string, RoleAccessSchema[]> = {};
    permissions?.forEach((perm) => {
        if (!groupedPermissions[perm.organizationId]) {
            groupedPermissions[perm.organizationId] = [];
        }
        groupedPermissions[perm.organizationId].push(perm);
    });

    const AcceptInvite = async (id: string) => {
        await acceptInvite(id);
    };

    return (
        <div className="p-6 min-h-screen light">
            <div className="flex items-start justify-between mb-8">
                <h1 className="text-3xl font-bold mb-8">Your Organizations</h1>
                <div className="  flex border border-gray-700 rounded-xl">
                    <AddOrganizationForm />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {organizations?.map((org) => (
                    <Link
                        key={org.id}
                        to={`/org/${org.id}/dashboard`}
                        className=" shadow-lg rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border"
                    >
                        <div className="flex items-center mb-4">
                            {org.logo ? (
                                <img
                                    src={org.logo}
                                    alt={org.name}
                                    className="h-16 w-16 rounded-full mr-4 object-cover"
                                />
                            ) : (
                                <FaBuilding className="h-16 w-16 text-blue-500 mr-4" />
                            )}
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {org.name}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {org.description ||
                                        "No description available."}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-blue-600 mt-4">
                            <span className="text-sm font-medium">
                                View Dashboard
                            </span>
                            <FaChevronRight className="h-4 w-4" />
                        </div>
                    </Link>
                ))}
            </div>

            <h1 className="text-3xl font-bold mt-12 mb-8">Your Permissions</h1>
            <div className="space-y-8">
                {Object.entries(groupedPermissions || {}).map(
                    ([orgId, perms]) => (
                        <div
                            key={orgId}
                            className=" shadow-lg rounded-xl p-6 border"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <HiOutlineOfficeBuilding className="h-8 w-8 text-blue-500 mr-3" />
                                    <h2 className="text-xl font-semibold">
                                        Organization ID: {orgId}
                                    </h2>
                                </div>
                                <Link
                                    to={`/org/${orgId}/dashboard`}
                                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                >
                                    <span className="text-sm font-medium mr-2">
                                        Go to Dashboard
                                    </span>
                                    <FaChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <ul className="space-y-3">
                                {perms.map((perm) => (
                                    <li
                                        key={perm.id}
                                        className="flex items-center rounded-lg p-3"
                                    >
                                        <FaUserShield className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="font-medium">
                                            {perm.access}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                )}
            </div>
            <div className="mt-12">
                <h1 className="text-3xl font-bold mb-8">Invites</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {invites?.map((invite) => (
                        <div
                            key={invite.id}
                            className="border shadow-lg rounded-xl p-6"
                        >
                            <div className="flex items-center mb-4">
                                <HiOutlineOfficeBuilding className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {invite.organizationId}
                                    </h2>
                                </div>
                            </div>
                            <Button
                                className="flex justify-between items-center text-blue-600 mt-4"
                                onClick={() => AcceptInvite(invite.id)}
                            >
                                <span className="text-sm font-medium">
                                    Accept Invite
                                </span>
                                <FaChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserOrgs;
