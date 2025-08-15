import { useState, useEffect, useMemo } from "react";
import { RoleAccess } from "@/data/types";
import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "../modules/Table";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { InviteUser } from "../modals/InviteUser";
import { RemoveModal } from "../modals/RemoveModal";
interface UserAccessListProps {
    access: RoleAccess[];
    inviteUser: (email: string) => Promise<void>;
    removeUser: (userId: string) => Promise<void>;
}

interface UserInfo {
    id: string;
    name: string;
    email: string;
    permissions: string[];
}

const UserAccessList: React.FC<UserAccessListProps> = ({
    access,
    removeUser,
    inviteUser,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const userCols: ColumnDef<UserInfo>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "permissions",
            header: "Permissions",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.permissions.map((perm) => (
                        <span
                            key={perm}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                            {perm}
                        </span>
                    ))}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "id",
            header: "Actions",
            cell: ({ row }) => (
                <RemoveModal
                    title="Remove Access"
                    description={`Are you sure you want to remove access for ${row.original.name}?`}
                    onRemove={() => removeUser(row.original.id)}
                />
            ),
            enableSorting: false,
        },
    ];

    const users = useMemo(() => {
        return access.reduce<UserInfo[]>(
            (acc, { userId, user, access: accessLevel }) => {
                const existingUser = acc.find((u) => u.id === userId);

                if (existingUser) {
                    if (!existingUser.permissions.includes(accessLevel)) {
                        existingUser.permissions.push(accessLevel);
                    }
                } else {
                    acc.push({
                        id: userId,
                        name: user?.name || "Unknown",
                        email: user?.email || "N/A",
                        permissions: [accessLevel],
                    });
                }

                return acc;
            },
            []
        );
    }, [access]);

    useEffect(() => {
        setIsLoading(false);
    }, [users]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-2xl shadow-none">
            <Card className="border-none w-full shadow-none p-0">
                <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        User Access
                    </h2>
                    <InviteUser onInvite={inviteUser} />
                </CardHeader>
                <CardContent className="pt-4">
                    {users.length ? (
                        <TableComponent
                            columns={userCols}
                            data={users}
                            allowSelection={false}
                            showFooter={true}
                            allowPagination
                        />
                    ) : (
                        <div className="text-center text-gray-500">
                            No users with access.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserAccessList;
