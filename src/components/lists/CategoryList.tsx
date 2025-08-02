import { Category } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import { RemoveModal } from "../modals/RemoveModal";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";
interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    error?: Error | null;
    onRetry: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    loading,
    error,
    onRetry,
}) => {
    if (loading) {
        return <div>Loading...</div>;
    }
    const { orgId } = useOrg();
    if (error) {
        return (
            <div>
                <div>Failed to load categories: {error.message}</div>
                <button onClick={onRetry}>Retry</button>
            </div>
        );
    }
    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/orgs/${orgId}/category/${id}`);
            onRetry();
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };
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
            cell: (props) =>
                new Date(props.row.original.createdAt).toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    }
                ),
        },
        {
            accessorKey: "updatedAt",
            header: "Updated At",
            cell: (props) =>
                new Date(props.row.original.updatedAt).toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    }
                ),
            enableSorting: false,
        },
        {
            accessorKey: "id",
            header: "Actions",
            cell: (props) => (
                <RemoveModal
                    title="Remove Category"
                    onRemove={() => handleDelete(props.row.original.id)}
                    description="Are you sure you want to remove this category?"
                />
            ),
            enableSorting: false,
        },
    ];
    return (
        <TableComponent
            columns={columns}
            data={categories}
            allowPagination={true}
            allowSearch={true}
            allowSelection={false}
        />
    );
};

export default CategoryList;
