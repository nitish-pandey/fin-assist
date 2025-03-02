import { Product } from "@/data/types";
import { TableComponent } from "../modules/Table";
import { ColumnDef } from "@tanstack/react-table";
interface ProductListProps {
    products: Product[];
    isLoading: boolean;
    error: string;
}

const productCols: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Name",
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
    },
    // {
    //     accessorKey: "id",
    //     header: "Actions",
    //     cell: (props) => {
    //         return (
    //             <RemoveModal
    //                 title="Delete Product"
    //                 description="Are you sure you want to delete this product?"
    //                 onRemove={() => {}}
    //             />
    //         );
    //     },
    //     enableSorting: false,
    // },
];

export const ProductList = ({ products, isLoading, error }: ProductListProps) => {
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="">
            <TableComponent
                columns={productCols}
                data={products}
                showFooter={true}
                allowSearch={true}
                allowPagination={true}
                allowSelection={true}
            />
        </div>
    );
};
