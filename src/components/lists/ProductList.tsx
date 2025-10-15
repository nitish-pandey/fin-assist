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

export const ProductList = ({ products, isLoading, error }: ProductListProps) => {
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
            header: "SKU",
            accessorKey: "sku",
        },
        {
            header: "Inventory",
            accessorKey: "variants",
            cell: (props) => {
                const totalInventory =
                    props.row.original.variants?.reduce(
                        (sum, variant) =>
                            sum +
                            (variant.stock_fifo_queue?.reduce(
                                (acc: number, queue) => acc + queue.availableStock * queue.buyPrice,
                                0
                            ) || 0),
                        0
                    ) || 0;
                return (
                    <span>
                        Rs{" "}
                        {totalInventory.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                        })}
                    </span>
                );
            },
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
