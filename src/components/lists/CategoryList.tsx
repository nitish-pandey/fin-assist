import { Category } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import { RemoveModal } from "../modals/RemoveModal";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductList } from "./ProductList";
import { Eye, Package } from "lucide-react";
import { Link } from "react-router-dom";
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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );

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

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setIsSheetOpen(true);
    };
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
            cell: (props) => (
                <Button
                    variant="link"
                    onClick={() => handleCategoryClick(props.row.original)}
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    {props.row.original.name.slice(0, 40)}
                </Button>
            ),
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
        <>
            <TableComponent
                columns={columns}
                data={categories}
                allowPagination={true}
                allowSearch={true}
                allowSelection={false}
                showFooter={true}
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="right"
                    className="w-[800px] sm:max-w-[800px]"
                >
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Products in "{selectedCategory?.name}"
                        </SheetTitle>
                    </SheetHeader>

                    <div className="mt-6">
                        {!selectedCategory ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    No category selected
                                </p>
                            </div>
                        ) : selectedCategory.products &&
                          selectedCategory.products.length > 0 ? (
                            <div className="h-[calc(100vh-180px)] overflow-auto">
                                <ProductList
                                    products={selectedCategory.products}
                                    isLoading={false}
                                    error=""
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">
                                    No products found in this category
                                </p>
                                <Link to={`/org/${orgId}/products/create`}>
                                    <Button>Create New Product</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default CategoryList;
