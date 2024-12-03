import { PropsWithChildren, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import {
    FaArrowUp,
    FaArrowDown,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { Button } from "@/components/ui/button"; // ShadCN Button
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // ShadCN Table components

interface TableComponentProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
}

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

export const TableComponent = <T,>({
    columns,
    data,
}: PropsWithChildren<TableComponentProps<T>>) => {
    const [sorting, setSorting] = useState<any[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useReactTable({
        columns,
        data,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full overflow-x-auto rounded-md border border-white">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="cursor-pointer select-none"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </span>
                                        {header.column.getIsSorted() && (
                                            <span>
                                                {header.column.getIsSorted() ===
                                                "desc" ? (
                                                    <FaArrowDown />
                                                ) : (
                                                    <FaArrowUp />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="hover:bg-muted transition-colors"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FaChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <FaChevronRight />
                    </Button>
                </div>
                <div className="text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
            </div>
        </div>
    );
};
