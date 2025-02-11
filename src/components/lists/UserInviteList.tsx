import { Invite } from "@/data/types";
import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "../modules/Table";
import { Card, CardHeader, CardContent } from "../ui/card";
import { RemoveModal } from "../modals/RemoveModal";

interface UserInviteListProps {
    invites: Invite[];
    removeInvite: (inviteId: string) => Promise<void>;
}

const UserInviteList: React.FC<UserInviteListProps> = ({ invites, removeInvite }) => {
    const inviteCols: ColumnDef<Invite>[] = [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: false,
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "createdAt",
            header: "Sent On",
            cell: (props) => new Date(props.row.original.createdAt).toLocaleDateString(),
        },
        {
            accessorKey: "updatedAt",
            header: "Last Updated",
            cell: (props) => new Date(props.row.original.updatedAt).toLocaleDateString(),
        },
        {
            accessorKey: "id",
            header: "Actions",
            enableSorting: false,
            cell: (props) => (
                <RemoveModal
                    title="Remove Invite"
                    description={`Are you sure you want to remove the invite for ${props.row.original.email}?`}
                    onRemove={() => removeInvite(props.row.original.id)}
                />
            ),
        },
    ];
    return (
        <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row justify-start items-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">User Invites</h2>
            </CardHeader>
            <CardContent className="pt-4">
                {invites.length ? (
                    <TableComponent
                        columns={inviteCols}
                        data={invites}
                        allowSearch={false}
                        allowPagination={false}
                    />
                ) : (
                    <div className="text-center text-gray-500">No pending invites.</div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserInviteList;
