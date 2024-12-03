import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "../modules/Table";
import { UserType } from "../../data/types";

const userCols: ColumnDef<UserType>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
];

interface UsersListProps {
    orgId: string;
}

const UsersList = ({ orgId }: UsersListProps) => {
    console.log(orgId);
    const users: UserType[] = [
        {
            id: "1",
            contact: "1234567890",
            status: "Active",
            name: "John Doe",
            email: "sad@as.asd",
            type: "Admin",
            createdAt: "2021-09-01",
            updatedAt: "2021-09-01",
        },
        {
            id: "1",
            contact: "1234567890",
            status: "Active",
            name: "John Doe",
            email: "sad@as.asd",
            type: "Admin",
            createdAt: "2021-09-01",
            updatedAt: "2021-09-01",
        },
    ];

    return (
        <div>
            <h1 className="text-white">Users</h1>
            <TableComponent columns={userCols} data={users} />
        </div>
    );
};

export default UsersList;
