import { Category } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import { RemoveModal } from "../modals/RemoveModal";
interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    error?: Error | null;
    onRetry: () => void;
}

const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (props) => new Date(props.row.original.createdAt).toLocaleDateString(),
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: (props) => new Date(props.row.original.updatedAt).toLocaleDateString(),
        enableSorting: false,
    },
    // {
    //     accessorKey: "id",
    //     header: "Actions",
    //     cell: (props) => (
    //         <RemoveModal
    //             title="Remove Category"
    //             onRemove={() => {}}
    //             description="Are you sure you want to remove this category?"
    //         />
    //     ),
    //     enableSorting: false,
    // },
];

const CategoryList: React.FC<CategoryListProps> = ({ categories, loading, error, onRetry }) => {
    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return (
            <div>
                <div>Failed to load categories: {error.message}</div>
                <button onClick={onRetry}>Retry</button>
            </div>
        );
    }
    return (
        <TableComponent
            columns={columns}
            data={categories}
            allowPagination={true}
            allowSearch={true}
            allowSelection={true}
        />
    );
};

export default CategoryList;
