import { Product } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useOrg } from "@/providers/org-provider";
import { Link } from "react-router-dom";
interface ProductListProps {
    products: Product[];
    isLoading: boolean;
    error: string;
}

export const ProductList = ({
    products,
    isLoading,
    error,
}: ProductListProps) => {
    if (error) {
        return <div>{error}</div>;
    }
    const { orgId } = useOrg();
    const productCols: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: (props) => {
                return (
                    <div className="flex items-center">
                        <Link
                            to={`/org/${orgId}/products/${props.row.original.id}`}
                            className="text-blue-500 hover:underline"
                        >
                            {props.row.original.name}
                        </Link>
                    </div>
                );
            },
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "price",
            header: "Price",
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: (props) => {
                return (
                    <div className="text-center">
                        {props.row.original.variants?.reduce(
                            (acc, variant) => acc + variant.stock,
                            0
                        )}
                    </div>
                );
            },
        },
        {
            header: "SKU",
            accessorKey: "sku",
        },
    ];
    return (
        <div className="">
            <TableComponent
                columns={productCols}
                data={products}
                showFooter={true}
                allowSearch={true}
                allowPagination={true}
                isLoading={isLoading}
                allowSelection={false}
            />
        </div>
    );
};
