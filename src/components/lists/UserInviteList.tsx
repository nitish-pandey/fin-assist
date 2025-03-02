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
            accessorKey: "status",
            header: "Status",
            cell: (props) => {
                const status = props.row.original.status;
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            status === "PENDING"
                                ? "bg-yellow-200 text-yellow-800"
                                : status === "ACCEPTED"
                                ? "bg-green-200 text-green-800"
                                : status === "REJECTED"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "id",
            header: "Actions",
            enableSorting: false,
            cell: (props) => (
                <div className="">
                    {props.row.original.status === "PENDING" && (
                        <RemoveModal
                            title="Remove Invite"
                            description={`Are you sure you want to remove the invite for ${props.row.original.email}?`}
                            onRemove={() => removeInvite(props.row.original.id)}
                        />
                    )}
                </div>
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
