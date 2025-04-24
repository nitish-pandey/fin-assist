"use client";

import { useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type RowSelectionState,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    Download,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedTableComponentProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    allowSearch?: boolean;
    allowPagination?: boolean;
    showFooter?: boolean;
    allowSelection?: boolean;
    title?: string;
    description?: string;
    onRowClick?: (row: T) => void;
    allowExport?: boolean;
    exportFileName?: string;
    isLoading?: boolean;
    emptyStateMessage?: string;
}

export function TableComponent<T>({
    columns,
    data,
    allowSearch = false,
    allowPagination = false,
    showFooter = false,
    allowSelection = false,
    title,
    description,
    onRowClick,
    allowExport = false,
    exportFileName = "table-data",
    isLoading = false,
    emptyStateMessage = "No results found.",
}: EnhancedTableComponentProps<T>) {
    const [sorting, setSorting] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        enableRowSelection: allowSelection,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            globalFilter,
            rowSelection,
        },
    });

    useEffect(() => {
        if (allowPagination) {
            table.setPageSize(10);
        }
    }, [allowPagination, table]);

    const exportToCSV = () => {
        const headers = columns.map((column) => column.header as string).join(",");
        const rows = table.getFilteredRowModel().rows.map((row) =>
            columns
                .map((column) => {
                    const value = row.getValue(column.id as string);
                    return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
                })
                .join(",")
        );
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${exportFileName}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Card className="w-full">
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </CardHeader>
            )}
            <CardContent>
                <div className="flex items-center justify-between py-2">
                    {allowSearch && (
                        <Input
                            placeholder="Search all columns..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="max-w-sm"
                        />
                    )}
                    <div className="flex items-center space-x-2">
                        {allowPagination && (
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Rows per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize} rows
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {allowExport && (
                            <Button variant="outline" size="sm" onClick={exportToCSV}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        )}
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {allowSelection && (
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={table.getIsAllPageRowsSelected()}
                                                onCheckedChange={(value) =>
                                                    table.toggleAllPageRowsSelected(!!value)
                                                }
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                    )}
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? "cursor-pointer select-none"
                                                            : ""
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getCanSort() && (
                                                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + (allowSelection ? 1 : 0)}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onClick={() => onRowClick && onRowClick(row.original)}
                                        className={
                                            onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                                        }
                                    >
                                        {allowSelection && (
                                            <TableCell className="w-[40px]">
                                                <Checkbox
                                                    checked={row.getIsSelected()}
                                                    onCheckedChange={(value) =>
                                                        row.toggleSelected(!!value)
                                                    }
                                                    aria-label="Select row"
                                                />
                                            </TableCell>
                                        )}
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + (allowSelection ? 1 : 0)}
                                        className="h-24 text-center"
                                    >
                                        {emptyStateMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {(showFooter || allowPagination) && (
                <CardFooter className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {allowSelection && (
                            <div className="mb-2">
                                <Badge variant="secondary">
                                    {Object.keys(rowSelection).length} row(s) selected
                                </Badge>
                            </div>
                        )}
                        {showFooter && (
                            <div>
                                Showing{" "}
                                {table.getState().pagination.pageIndex *
                                    table.getState().pagination.pageSize +
                                    1}{" "}
                                to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) *
                                        table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} entries
                            </div>
                        )}
                    </div>
                    {allowPagination && (
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
