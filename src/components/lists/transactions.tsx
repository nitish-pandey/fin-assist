import { Transaction } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
interface TransactionsListProps {
    transactions: Transaction[];
    isLoading: boolean;
    error: string;
    refetch: () => void;
}

const columns: ColumnDef<Transaction>[] = [
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "Type",
        accessorKey: "type",
    },
    {
        header: "Amount",
        accessorKey: "amount",
    },
    {
        header: "Date",
        accessorKey: "date",
    },
    {
        header: "Status",
        accessorKey: "status",
    },
    {
        header: "Actions",
        accessorKey: "actions",
    },
];

export const TransactionsList: React.FC<TransactionsListProps> = ({
    transactions,
    isLoading,
    error,
    refetch,
}) => {
    return <TableComponent columns={columns} data={transactions} isLoading={isLoading} />;
};
