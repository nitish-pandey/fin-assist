import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Invite } from "@/data/types";
import { api } from "@/utils/api";
import { TableComponent } from "@/components/modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import { RemoveModal } from "@/components/modals/RemoveModal";
import { AcceptModal } from "@/components/modals/AcceptModal";

const UserInvitePages: React.FC = () => {
    const { user } = useAuth();
    const [invites, setInvites] = useState<Invite[]>([]);

    const fetchInvites = async () => {
        const res = await api.get("/users/" + user?.id + "/invites");
        setInvites(res.data);
    };

    const acceptInvite = async (inviteId: string) => {
        await api.post("/users/" + user?.id + "/invites/accept", {
            inviteId,
        });
        fetchInvites();
    };
    const columns: ColumnDef<Invite>[] = [
        {
            header: "Email",
            accessorKey: "email",
        },
        {
            header: "Organization",
            accessorKey: "organization.name",
        },
        {
            header: "Created At",
            accessorKey: "createdAt",
            cell: (props) => new Date(props.row.original.createdAt).toLocaleDateString(),
        },
        {
            header: "Status",
            accessorKey: "status",
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
            header: "Actions",
            accessorKey: "id",
            cell: (props) => (
                <div className="flex gap-2">
                    {props.row.original.status === "PENDING" ? (
                        <>
                            <AcceptModal
                                title="Accept Invite"
                                onAccept={() => acceptInvite(props.row.original.id)}
                                description="Are you sure you want to accept this invite?"
                            />
                            <RemoveModal
                                title="Reject Invite"
                                onRemove={() => rejectInvite(props.row.original.id)}
                                description="Are you sure you want to reject this invite?"
                            />
                        </>
                    ) : null}
                </div>
            ),
            enableSorting: false,
        },
    ];

    const rejectInvite = async (inviteId: string) => {
        await api.post("/users/" + user?.id + "/invites/reject", {
            inviteId,
        });
        fetchInvites();
    };

    useEffect(() => {
        fetchInvites();
    }, []);
    return (
        <div className="container mx-auto max-w-7xl p-6">
            <h2 className="text-2xl font-semibold">Invites</h2>
            <div className="mt-4">
                <TableComponent data={invites} columns={columns} />
            </div>
        </div>
    );
};

export default UserInvitePages;
