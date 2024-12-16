import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "../modules/Table";
import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { getOrgUsers } from "@/utils/api";

interface UserInfo {
    id: string;
    name: string;
    email: string;
    permissions: string[];
}

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
        cell(props) {
            return (
                <div>
                    {props.row.original.permissions.map((perm) => (
                        <span key={perm} className="mr-2">
                            {perm}
                        </span>
                    ))}
                </div>
            );
        },
    },
];

interface UsersListProps {
    orgId: string;
}

const UsersList = ({ orgId }: UsersListProps) => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const cookies = new Cookies();

    useEffect(() => {
        // fetch users
        const token = cookies.get("token");
        getOrgUsers(orgId, token)
            .then((data) => {
                // group by user
                const users: UserInfo[] = [];
                data.forEach((perm) => {
                    const user = users.find((u) => u.id === perm.userId);
                    if (user) {
                        user.permissions.push(perm.access);
                    } else {
                        users.push({
                            id: perm.userId,
                            name: perm.user?.name || "",
                            email: perm.user?.email || "",
                            permissions: [perm.access],
                        });
                    }
                });
                setUsers(users);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [orgId]);

    return (
        <div>
            <h1 className="text-white">Users</h1>
            <TableComponent columns={userCols} data={users} />
        </div>
    );
};

export default UsersList;
