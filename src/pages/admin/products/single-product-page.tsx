"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    // Truck,
    // Calendar,
    ChevronDown,
    ChevronUp,
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
import { useOrg } from "@/providers/org-provider";
import { useParams } from "react-router-dom";
import { api } from "@/utils/api";
import { Product } from "@/data/types";

const SingleProductPage = () => {
    const { productId } = useParams<{ productId: string }>() as {
        productId: string;
    };

    const orgId = useOrg().orgId;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `orgs/${orgId}/products/${productId}`
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
    const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

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
        : product.stock;

    const lowStockThreshold = 5;
    const hasLowStock = totalStock <= lowStockThreshold;
    const toggleVariantExpand = (variantId: string) => {
        if (expandedVariant === variantId) {
            setExpandedVariant(null);
        } else {
            setExpandedVariant(variantId);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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

                <div className="flex items-center space-x-2"></div>
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
                                    <div className="text-lg font-semibold">
                                        Rs {product.price.toFixed(2)}
                                    </div>
                                    <Badge
                                        variant={
                                            hasLowStock
                                                ? "destructive"
                                                : "secondary"
                                        }
                                        className="mt-1"
                                    >
                                        {hasLowStock ? "Low Stock" : "In Stock"}
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Product Information */}
                            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                                <div className="font-medium">Product Code</div>
                                <div>{product.code}</div>

                                <div className="font-medium">SKU</div>
                                <div>{product.sku}</div>

                                <div className="font-medium">Total Stock</div>
                                <div>{totalStock} units</div>

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
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="variants">
                                Variants ({product.variants?.length || 0})
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
                                                                Price
                                                            </TableHead>
                                                            <TableHead>
                                                                Stock
                                                            </TableHead>
                                                            {/* <TableHead className="text-right">
                                                                Actions
                                                            </TableHead> */}
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
                                                                        <TableCell>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() =>
                                                                                    toggleVariantExpand(
                                                                                        variant.id
                                                                                    )
                                                                                }
                                                                            >
                                                                                {expandedVariant ===
                                                                                variant.id ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                )}
                                                                            </Button>
                                                                        </TableCell>
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
                                                                            {variant.price.toFixed(
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

                                                                    {/* Expanded variant details */}
                                                                    {expandedVariant ===
                                                                        variant.id && (
                                                                        <TableRow>
                                                                            <TableCell
                                                                                colSpan={
                                                                                    6
                                                                                }
                                                                                className="bg-muted/50"
                                                                            >
                                                                                <div className="p-4">
                                                                                    <h4 className="font-medium mb-2">
                                                                                        Variant
                                                                                        Details
                                                                                    </h4>
                                                                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                                                        <div className="font-medium">
                                                                                            Code
                                                                                        </div>
                                                                                        <div>
                                                                                            {
                                                                                                variant.code
                                                                                            }
                                                                                        </div>

                                                                                        {variant.description && (
                                                                                            <>
                                                                                                <div className="font-medium">
                                                                                                    Description
                                                                                                </div>
                                                                                                <div>
                                                                                                    {
                                                                                                        variant.description
                                                                                                    }
                                                                                                </div>
                                                                                            </>
                                                                                        )}

                                                                                        {variant.values &&
                                                                                            Object.entries(
                                                                                                variant.values
                                                                                            ).map(
                                                                                                (
                                                                                                    [
                                                                                                        key,
                                                                                                        value,
                                                                                                    ],
                                                                                                    index
                                                                                                ) => (
                                                                                                    <React.Fragment
                                                                                                        key={
                                                                                                            index
                                                                                                        }
                                                                                                    >
                                                                                                        <div className="font-medium">
                                                                                                            {
                                                                                                                key
                                                                                                            }
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            {String(
                                                                                                                value
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </React.Fragment>
                                                                                                )
                                                                                            )}

                                                                                        <div className="font-medium">
                                                                                            Created
                                                                                        </div>
                                                                                        <div>
                                                                                            {formatDate(
                                                                                                variant.createdAt
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="font-medium">
                                                                                            Last
                                                                                            Updated
                                                                                        </div>
                                                                                        <div>
                                                                                            {formatDate(
                                                                                                variant.updatedAt
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )}
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
