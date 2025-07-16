import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    allowSearch?: boolean;
    allowPagination?: boolean;
    showFooter?: boolean;
    allowSelection?: boolean;
    title?: boolean;
    description?: boolean;
    allowExport?: boolean;
}

export function TableSkeleton({
    columns = 4,
    rows = 5,
    allowSearch = false,
    allowPagination = false,
    showFooter = false,
    allowSelection = false,
    title = false,
    description = false,
    allowExport = false,
}: TableSkeletonProps) {
    return (
        <Card className="w-full">
            {title && (
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    {description && <Skeleton className="h-4 w-96 mt-2" />}
                </CardHeader>
            )}
            <CardContent>
                <div className="flex items-center justify-between py-2">
                    {allowSearch && (
                        <Skeleton className="h-9 w-64" />
                    )}
                    <div className="flex items-center space-x-2">
                        {allowPagination && (
                            <Skeleton className="h-9 w-[180px]" />
                        )}
                        {allowExport && (
                            <Skeleton className="h-9 w-24" />
                        )}
                    </div>
                </div>
                
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {allowSelection && (
                                    <TableHead className="w-[40px]">
                                        <Checkbox disabled />
                                    </TableHead>
                                )}
                                {Array.from({ length: columns }).map((_, index) => (
                                    <TableHead key={index}>
                                        <div className="flex items-center">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="ml-2 h-4 w-4" />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {allowSelection && (
                                        <TableCell className="w-[40px]">
                                            <Checkbox disabled />
                                        </TableCell>
                                    )}
                                    {Array.from({ length: columns }).map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton 
                                                className={`h-4 ${
                                                    colIndex === 0 
                                                        ? "w-32" 
                                                        : colIndex === 1 
                                                        ? "w-24" 
                                                        : colIndex === 2 
                                                        ? "w-28" 
                                                        : "w-20"
                                                }`} 
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            
            {(showFooter || allowPagination) && (
                <CardFooter className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {allowSelection && (
                            <div className="mb-2">
                                <Skeleton className="h-5 w-20" />
                            </div>
                        )}
                        {showFooter && (
                            <Skeleton className="h-4 w-48" />
                        )}
                    </div>
                    {allowPagination && (
                        <div className="space-x-2 flex">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

// Alternative simplified version for quick loading states
export function SimpleTableSkeleton({ 
    rows = 5, 
    columns = 4 
}: { 
    rows?: number; 
    columns?: number; 
}) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, index) => (
                            <TableHead key={index}>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
