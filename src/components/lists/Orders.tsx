import { Order } from "@/data/types";
import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "../modules/Table";
import { Link } from "react-router-dom";

interface OrderListProps {
    orders: Order[];
}

const columns: ColumnDef<Order>[] = [
    {
        header: "Order Number",
        accessorKey: "orderNumber",
        enableSorting: false,
        cell: (props) => (
            <Link
                to={`/org/${props.row.original.organizationId}/orders/${props.row.original.id}`}
                className="text-black  font-semibold hover:underline hover:text-blue-600"
            >
                {props.row.original.orderNumber}
            </Link>
        ),
    },
    {
        header: "Type",
        accessorKey: "type",
        enableSorting: false,
    },
    {
        header: "Status",
        accessorKey: "paymentStatus",
        enableSorting: false,
        cell: (props) => {
            if (props.row.original.paymentStatus === "PAID") {
                return (
                    <span className="bg-green-500 text-white px-2 py-1 my-1 rounded-lg">
                        PAID
                    </span>
                );
            } else if (props.row.original.paymentStatus === "PENDING") {
                return (
                    <span className="bg-yellow-500 text-white px-2 py-1 my-1 rounded-lg">
                        PENDING
                    </span>
                );
            } else if (props.row.original.paymentStatus === "PARTIAL") {
                return (
                    <span className="bg-blue-500 text-white px-2 py-1 my-1 rounded-lg">
                        PARTIAL
                    </span>
                );
            }
            return (
                <span className="bg-red-500 text-white px-2 py-1 my-1 rounded-lg">
                    FAILED
                </span>
            );
        },
    },
    {
        header: "Total Amount",
        accessorKey: "totalAmount",
    },
    // no of items
    {
        header: "No of Items",
        accessorKey: "items",
        cell: (props) => props.row.original.items?.length,
    },
    {
        header: "Created At",
        accessorKey: "createdAt",
        cell: (props) =>
            new Date(props.row.original.createdAt).toLocaleDateString(),
    },
];

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    return (
        <TableComponent
            columns={columns}
            data={orders}
            allowPagination
            allowSearch
            showFooter
        />
    );
};
