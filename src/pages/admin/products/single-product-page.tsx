"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    // Edit,
    // Trash2,
    // Archive,
    // Copy,
    // MoreHorizontal,
    AlertCircle,
    Package,
    Tag,
    // Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { useOrg } from "@/providers/org-provider";
import { useParams } from "react-router-dom";
import { api } from "@/utils/api";
import { Product } from "@/data/types";
import { RemoveModal } from "@/components/modals/RemoveModal";
import { useToast } from "@/hooks/use-toast";

// Custom Publish Modal Component
const PublishModal: React.FC<{
    isPublished: boolean;
    onToggle: () => Promise<void>;
    loading: boolean;
}> = ({ isPublished, onToggle, loading }) => {
    const [modalLoading, setModalLoading] = useState(false);
    const { toast } = useToast();

    const handleToggle = async () => {
        try {
            setModalLoading(true);
            await onToggle();
            toast({
                title: "Success",
                description: `Product ${
                    isPublished ? "unpublished" : "published"
                } successfully.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${
                    isPublished ? "unpublish" : "publish"
                } product.`,
                variant: "destructive",
            });
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={isPublished ? "outline" : "default"}
                    disabled={loading}
                >
                    {loading
                        ? isPublished
                            ? "Unpublishing..."
                            : "Publishing..."
                        : isPublished
                        ? "Unpublish"
                        : "Publish"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {isPublished ? "Unpublish Product" : "Publish Product"}
                </DialogTitle>
                <DialogDescription>
                    {isPublished
                        ? "Are you sure you want to unpublish this product? It will no longer be visible to customers."
                        : "Are you sure you want to publish this product? It will be visible to customers."}
                </DialogDescription>
                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={modalLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleToggle}
                        variant={isPublished ? "outline" : "default"}
                        disabled={modalLoading}
                    >
                        {modalLoading
                            ? isPublished
                                ? "Unpublishing..."
                                : "Publishing..."
                            : isPublished
                            ? "Unpublish"
                            : "Publish"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SingleProductPage = () => {
    const { productId } = useParams<{ productId: string }>() as {
        productId: string;
    };

    const orgId = useOrg().orgId;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publishLoading, setPublishLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `/orgs/${orgId}/products/${productId}`
                );
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, orgId]);
    const navigate = useNavigate();

    const handleDeleteProduct = async () => {
        if (!product) return;
        try {
            await api.delete(`orgs/${orgId}/products/${product.id}`);
            // Redirect or show success message
            console.log("Product deleted successfully");
            navigate(`/org/${orgId}/products`);
        } catch (error) {
            console.error("Error deleting product:", error);
            setError("Failed to delete product. Please try again.");
            throw new Error("Failed to delete product");
        }
    };

    const handleTogglePublish = async () => {
        if (!product) return;
        try {
            setPublishLoading(true);
            const response = await api.put(
                `/orgs/${orgId}/products/${product.id}`,
                {
                    isPublished: !product.isPublished,
                }
            );
            setProduct(response.data.data);
            console.log(
                `Product ${
                    product.isPublished ? "unpublished" : "published"
                } successfully`
            );
        } catch (error) {
            console.error("Error updating product:", error);
            setError("Failed to update product. Please try again.");
            throw new Error("Failed to update product");
        } finally {
            setPublishLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/3" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Product not found.</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link to="/products">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
    const totalStock = product.variants
        ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        : 0;

    const lowStockThreshold = 5;
    const hasLowStock = totalStock <= lowStockThreshold;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with back button and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                    <Link to={`/org/${orgId}/products`}>
                        <Button variant="outline" size="sm" className="mr-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Product Details</h1>
                </div>

                <div className="flex items-center space-x-2">
                    <PublishModal
                        isPublished={product.isPublished}
                        onToggle={handleTogglePublish}
                        loading={publishLoading}
                    />
                    <RemoveModal
                        title="Delete Product"
                        text="Delete Product"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onRemove={handleDeleteProduct}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Product Details */}
                <div className="md:col-span-3">
                    <Card>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {product.name}
                                    </h2>
                                    {product.category && (
                                        <Badge
                                            variant="outline"
                                            className="mt-1"
                                        >
                                            {product.category.name}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant={
                                                hasLowStock
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {hasLowStock
                                                ? "Low Stock"
                                                : "In Stock"}
                                        </Badge>
                                        <Badge
                                            variant={
                                                product.isPublished
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {product.isPublished
                                                ? "Published"
                                                : "Draft"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Product Information */}
                            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                                <div className="font-medium">SKU</div>
                                <div>{product.sku}</div>

                                <div className="font-medium">Status</div>
                                <div>
                                    <Badge
                                        variant={
                                            product.isPublished
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {product.isPublished
                                            ? "Published"
                                            : "Draft"}
                                    </Badge>
                                </div>

                                <div className="font-medium">Total Stock</div>
                                <div>{totalStock} units</div>

                                <div className="font-medium">
                                    Total Variants
                                </div>
                                <div>{product.variants?.length || 0}</div>

                                <div className="font-medium">Stock Value</div>
                                <div>
                                    {formatCurrency(
                                        product.variants?.reduce(
                                            (sum, variant) =>
                                                sum +
                                                variant.stock *
                                                    variant.buyPrice,
                                            0
                                        ) || 0
                                    )}
                                </div>

                                <div className="font-medium">Category</div>
                                <div>
                                    {product.category?.name || "Uncategorized"}
                                </div>

                                <div className="font-medium">Created</div>
                                <div>{formatDate(product.createdAt)}</div>

                                <div className="font-medium">Last Updated</div>
                                <div>{formatDate(product.updatedAt)}</div>
                            </div>

                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-2">
                                        Description
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Tabs for additional information */}
                    <Tabs defaultValue="variants" className="mt-6">
                        <TabsList className="grid grid-cols-4">
                            <TabsTrigger value="variants">
                                Variants ({product.variants?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="ledger">
                                Variant Ledger
                            </TabsTrigger>
                            <TabsTrigger value="inventory">
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        {/* Variants Tab */}
                        <TabsContent value="variants" className="mt-4">
                            <Card>
                                <div className="p-6">
                                    {product.variants &&
                                    product.variants.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-medium">
                                                    Product Variants
                                                </h3>
                                                {/* <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Variant
                                                </Button> */}
                                                <div></div>
                                            </div>

                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[50px]"></TableHead>
                                                            <TableHead>
                                                                Name
                                                            </TableHead>
                                                            <TableHead>
                                                                SKU
                                                            </TableHead>
                                                            <TableHead>
                                                                Buy Price
                                                            </TableHead>
                                                            <TableHead>
                                                                Sell Price
                                                            </TableHead>
                                                            <TableHead>
                                                                Stock
                                                            </TableHead>
                                                            <TableHead>
                                                                Orders
                                                            </TableHead>
                                                            <TableHead>
                                                                Last Activity
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {product.variants.map(
                                                            (variant) => (
                                                                <React.Fragment
                                                                    key={
                                                                        variant.id
                                                                    }
                                                                >
                                                                    <TableRow>
                                                                        <TableCell></TableCell>
                                                                        <TableCell className="font-medium">
                                                                            {
                                                                                variant.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                variant.sku
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Rs{" "}
                                                                            {variant.buyPrice.toFixed(
                                                                                2
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Rs{" "}
                                                                            {variant.estimatedPrice.toFixed(
                                                                                2
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                variant={
                                                                                    variant.stock <=
                                                                                    lowStockThreshold
                                                                                        ? "destructive"
                                                                                        : "secondary"
                                                                                }
                                                                            >
                                                                                {
                                                                                    variant.stock
                                                                                }
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">
                                                                                {variant
                                                                                    .items
                                                                                    ?.length ||
                                                                                    0}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-sm text-muted-foreground">
                                                                            {variant.items &&
                                                                            variant
                                                                                .items
                                                                                .length >
                                                                                0
                                                                                ? formatDate(
                                                                                      variant
                                                                                          .items[
                                                                                          variant
                                                                                              .items
                                                                                              .length -
                                                                                              1
                                                                                      ]
                                                                                          .createdAt
                                                                                  )
                                                                                : "No activity"}
                                                                        </TableCell>
                                                                        {/* <TableCell className="text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                Edit
                                                                            </span>
                                                                        </Button>
                                                                    </TableCell> */}
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">
                                                No Variants
                                            </h3>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                This product doesn't have any
                                                variants.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Variant Ledger Tab */}
                        <TabsContent value="ledger" className="mt-4">
                            <Card>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium">
                                            Variant Ledger
                                        </h3>
                                        <div className="text-sm text-muted-foreground">
                                            Complete transaction history for all
                                            variants
                                        </div>
                                    </div>

                                    {product.variants &&
                                    product.variants.length > 0 ? (
                                        <div className="space-y-6">
                                            {product.variants.map((variant) => {
                                                // Calculate running totals
                                                const sortedItems =
                                                    variant.items?.sort(
                                                        (a, b) =>
                                                            new Date(
                                                                a.createdAt
                                                            ).getTime() -
                                                            new Date(
                                                                b.createdAt
                                                            ).getTime()
                                                    ) || [];

                                                // Calculate total bought and sold
                                                const totalBought = sortedItems
                                                    .filter(
                                                        (item) =>
                                                            item.order?.type ===
                                                            "BUY"
                                                    )
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum + item.quantity,
                                                        0
                                                    );

                                                const totalSold = sortedItems
                                                    .filter(
                                                        (item) =>
                                                            item.order?.type ===
                                                            "SELL"
                                                    )
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum + item.quantity,
                                                        0
                                                    );

                                                const buyItems =
                                                    sortedItems.filter(
                                                        (item) =>
                                                            item.order?.type ===
                                                            "BUY"
                                                    );
                                                const sellItems =
                                                    sortedItems.filter(
                                                        (item) =>
                                                            item.order?.type ===
                                                            "SELL"
                                                    );

                                                const avgBuyPrice =
                                                    buyItems.length > 0
                                                        ? buyItems.reduce(
                                                              (sum, item) =>
                                                                  sum +
                                                                  item.price,
                                                              0
                                                          ) / buyItems.length
                                                        : 0;

                                                const avgSellPrice =
                                                    sellItems.length > 0
                                                        ? sellItems.reduce(
                                                              (sum, item) =>
                                                                  sum +
                                                                  item.price,
                                                              0
                                                          ) / sellItems.length
                                                        : 0;

                                                return (
                                                    <div
                                                        key={variant.id}
                                                        className="border rounded-lg"
                                                    >
                                                        <div className="bg-muted/50 px-4 py-3 border-b">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-medium">
                                                                        {
                                                                            variant.name
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        SKU:{" "}
                                                                        {
                                                                            variant.sku
                                                                        }{" "}
                                                                        | Code:{" "}
                                                                        {
                                                                            variant.code
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-medium">
                                                                        Current
                                                                        Stock:{" "}
                                                                        <Badge variant="outline">
                                                                            {
                                                                                variant.stock
                                                                            }
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Summary Stats */}
                                                        <div className="p-4 border-b bg-background">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                                                    <div className="font-medium text-green-800">
                                                                        Total
                                                                        Bought
                                                                    </div>
                                                                    <div className="text-lg font-bold text-green-900">
                                                                        {
                                                                            totalBought
                                                                        }
                                                                    </div>
                                                                    {avgBuyPrice >
                                                                        0 && (
                                                                        <div className="text-xs text-green-600">
                                                                            Avg:{" "}
                                                                            {formatCurrency(
                                                                                avgBuyPrice
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                                                                    <div className="font-medium text-red-800">
                                                                        Total
                                                                        Sold
                                                                    </div>
                                                                    <div className="text-lg font-bold text-red-900">
                                                                        {
                                                                            totalSold
                                                                        }
                                                                    </div>
                                                                    {avgSellPrice >
                                                                        0 && (
                                                                        <div className="text-xs text-red-600">
                                                                            Avg:{" "}
                                                                            {formatCurrency(
                                                                                avgSellPrice
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                                                    <div className="font-medium text-blue-800">
                                                                        Net
                                                                        Movement
                                                                    </div>
                                                                    <div className="text-lg font-bold text-blue-900">
                                                                        {totalBought -
                                                                            totalSold}
                                                                    </div>
                                                                    <div className="text-xs text-blue-600">
                                                                        {totalBought >
                                                                        totalSold
                                                                            ? "Surplus"
                                                                            : totalBought <
                                                                              totalSold
                                                                            ? "Deficit"
                                                                            : "Balanced"}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                                                                    <div className="font-medium text-purple-800">
                                                                        Total
                                                                        Orders
                                                                    </div>
                                                                    <div className="text-lg font-bold text-purple-900">
                                                                        {
                                                                            sortedItems.length
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-purple-600">
                                                                        Transactions
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Transaction Ledger */}
                                                        {sortedItems.length >
                                                        0 ? (
                                                            <div className="overflow-x-auto">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>
                                                                                Date
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Order
                                                                                #
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Type
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Quantity
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Rate
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Amount
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Running
                                                                                Stock
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Status
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                Entity
                                                                            </TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {sortedItems.map(
                                                                            (
                                                                                item,
                                                                                index
                                                                            ) => {
                                                                                // Calculate running stock up to this point
                                                                                const runningStock =
                                                                                    sortedItems
                                                                                        .slice(
                                                                                            0,
                                                                                            index +
                                                                                                1
                                                                                        )
                                                                                        .reduce(
                                                                                            (
                                                                                                stock,
                                                                                                currentItem
                                                                                            ) => {
                                                                                                if (
                                                                                                    currentItem
                                                                                                        .order
                                                                                                        ?.type ===
                                                                                                    "BUY"
                                                                                                ) {
                                                                                                    return (
                                                                                                        stock +
                                                                                                        currentItem.quantity
                                                                                                    );
                                                                                                } else if (
                                                                                                    currentItem
                                                                                                        .order
                                                                                                        ?.type ===
                                                                                                    "SELL"
                                                                                                ) {
                                                                                                    return (
                                                                                                        stock -
                                                                                                        currentItem.quantity
                                                                                                    );
                                                                                                }
                                                                                                return stock;
                                                                                            },
                                                                                            0
                                                                                        );

                                                                                const totalAmount =
                                                                                    item.quantity *
                                                                                    item.price;

                                                                                return (
                                                                                    <TableRow
                                                                                        key={
                                                                                            item.id
                                                                                        }
                                                                                    >
                                                                                        <TableCell>
                                                                                            {formatDate(
                                                                                                item.createdAt
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell className="font-mono text-xs">
                                                                                            {item
                                                                                                .order
                                                                                                ?.orderNumber ||
                                                                                                "N/A"}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Badge
                                                                                                variant={
                                                                                                    item
                                                                                                        .order
                                                                                                        ?.type ===
                                                                                                    "BUY"
                                                                                                        ? "secondary"
                                                                                                        : item
                                                                                                              .order
                                                                                                              ?.type ===
                                                                                                          "SELL"
                                                                                                        ? "default"
                                                                                                        : "outline"
                                                                                                }
                                                                                                className={
                                                                                                    item
                                                                                                        .order
                                                                                                        ?.type ===
                                                                                                    "BUY"
                                                                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                                                                        : item
                                                                                                              .order
                                                                                                              ?.type ===
                                                                                                          "SELL"
                                                                                                        ? "bg-red-100 text-red-800 border-red-300"
                                                                                                        : ""
                                                                                                }
                                                                                            >
                                                                                                {item
                                                                                                    .order
                                                                                                    ?.type ||
                                                                                                    "MISC"}
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell className="font-medium">
                                                                                            <span
                                                                                                className={
                                                                                                    item
                                                                                                        .order
                                                                                                        ?.type ===
                                                                                                    "BUY"
                                                                                                        ? "text-green-600"
                                                                                                        : item
                                                                                                              .order
                                                                                                              ?.type ===
                                                                                                          "SELL"
                                                                                                        ? "text-red-600"
                                                                                                        : ""
                                                                                                }
                                                                                            >
                                                                                                {item
                                                                                                    .order
                                                                                                    ?.type ===
                                                                                                "BUY"
                                                                                                    ? "+"
                                                                                                    : "-"}
                                                                                                {
                                                                                                    item.quantity
                                                                                                }
                                                                                            </span>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {formatCurrency(
                                                                                                item.price
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell className="font-medium">
                                                                                            {formatCurrency(
                                                                                                totalAmount
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="font-mono"
                                                                                            >
                                                                                                {
                                                                                                    runningStock
                                                                                                }
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Badge
                                                                                                variant={
                                                                                                    item
                                                                                                        .order
                                                                                                        ?.paymentStatus ===
                                                                                                    "PAID"
                                                                                                        ? "default"
                                                                                                        : item
                                                                                                              .order
                                                                                                              ?.paymentStatus ===
                                                                                                          "PENDING"
                                                                                                        ? "secondary"
                                                                                                        : "destructive"
                                                                                                }
                                                                                            >
                                                                                                {item
                                                                                                    .order
                                                                                                    ?.paymentStatus ||
                                                                                                    "N/A"}
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell className="text-sm">
                                                                                            {item
                                                                                                .order
                                                                                                ?.entity
                                                                                                ?.name ||
                                                                                                "N/A"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 text-center text-muted-foreground">
                                                                <Package className="mx-auto h-8 w-8 mb-2" />
                                                                <p>
                                                                    No
                                                                    transactions
                                                                    found for
                                                                    this variant
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">
                                                No Variants
                                            </h3>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                This product doesn't have any
                                                variants to show ledger for.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="mt-4">
                            <Card>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium">
                                            Inventory Management
                                        </h3>
                                        {/* <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adjust Stock
                                        </Button> */}
                                        <div></div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        <Card className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-primary/10 p-3 rounded-full">
                                                    <Package className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Total Stock
                                                    </p>
                                                    <p className="text-2xl font-bold">
                                                        {totalStock}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-primary/10 p-3 rounded-full">
                                                    <Tag className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        SKU
                                                    </p>
                                                    <p className="text-lg font-medium">
                                                        {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* <Card className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-primary/10 p-3 rounded-full">
                                                    <Truck className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Last Restock
                                                    </p>
                                                    <p className="text-lg font-medium">
                                                        May 10, 2023
                                                    </p>
                                                </div>
                                            </div>
                                        </Card> */}
                                    </div>

                                    <h4 className="font-medium mb-4">
                                        Variant Stock Details
                                    </h4>
                                    {product.variants &&
                                    product.variants.length > 0 ? (
                                        <div className="border rounded-md mb-6">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Variant
                                                        </TableHead>
                                                        <TableHead>
                                                            SKU
                                                        </TableHead>
                                                        <TableHead>
                                                            Current Stock
                                                        </TableHead>
                                                        <TableHead>
                                                            Buy Price
                                                        </TableHead>
                                                        <TableHead>
                                                            Sell Price
                                                        </TableHead>
                                                        <TableHead>
                                                            Stock Value
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {product.variants.map(
                                                        (variant) => {
                                                            const stockValue =
                                                                variant.stock *
                                                                variant.buyPrice;
                                                            const isLowStock =
                                                                variant.stock <=
                                                                lowStockThreshold;

                                                            return (
                                                                <TableRow
                                                                    key={
                                                                        variant.id
                                                                    }
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            variant.name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="font-mono text-xs">
                                                                        {
                                                                            variant.sku
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant={
                                                                                isLowStock
                                                                                    ? "destructive"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {
                                                                                variant.stock
                                                                            }{" "}
                                                                            units
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {formatCurrency(
                                                                            variant.buyPrice
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {formatCurrency(
                                                                            variant.estimatedPrice
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">
                                                                        Rs{" "}
                                                                        {stockValue.toFixed(
                                                                            2
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant={
                                                                                isLowStock
                                                                                    ? "destructive"
                                                                                    : "default"
                                                                            }
                                                                        >
                                                                            {isLowStock
                                                                                ? "Low Stock"
                                                                                : "Normal"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    )}
                                                    <TableRow className="bg-muted/50 font-medium">
                                                        <TableCell
                                                            colSpan={5}
                                                            className="text-right"
                                                        >
                                                            Total Stock Value:
                                                        </TableCell>
                                                        <TableCell className="font-bold">
                                                            Rs{" "}
                                                            {product.variants
                                                                .reduce(
                                                                    (
                                                                        sum,
                                                                        variant
                                                                    ) =>
                                                                        sum +
                                                                        variant.stock *
                                                                            variant.buyPrice,
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </TableCell>
                                                        <TableCell></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground mb-6">
                                            No variants available
                                        </div>
                                    )}

                                    <h4 className="font-medium mb-4">
                                        Stock History
                                    </h4>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>
                                                        Quantity
                                                    </TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* <TableRow>
                                                    <TableCell>May 10, 2023</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-50 text-green-700 border-green-200"
                                                        >
                                                            Stock In
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>+10</TableCell>
                                                    <TableCell>John Doe</TableCell>
                                                    <TableCell>Regular inventory restock</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Apr 25, 2023</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-red-50 text-red-700 border-red-200"
                                                        >
                                                            Stock Out
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>-2</TableCell>
                                                    <TableCell>Jane Smith</TableCell>
                                                    <TableCell>Order #12345</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Apr 15, 2023</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-amber-50 text-amber-700 border-amber-200"
                                                        >
                                                            Adjustment
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>-1</TableCell>
                                                    <TableCell>Jane Smith</TableCell>
                                                    <TableCell>
                                                        Inventory count correction
                                                    </TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="text-center"
                                                    >
                                                        No stock history
                                                        available.
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-medium mb-6">
                                        Product History
                                    </h3>

                                    <div className="relative pl-6 border-l border-border">
                                        <p className="text-center text-muted-foreground">
                                            Created on{" "}
                                            {formatDate(product.createdAt)} with{" "}
                                            {product?.variants?.length || 0}{" "}
                                            variant(s).
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default SingleProductPage;
