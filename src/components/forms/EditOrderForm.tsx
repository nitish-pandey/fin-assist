"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Entity, Product, Account } from "@/data/types";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import EntitySelector from "../modules/entity-selector";
import PaymentSelector from "../modules/payment-selector";
import CalculationSelector from "../modules/calculation-selector";
import { ArrowLeft, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useOrg } from "@/providers/org-provider";

interface EditOrderFormData {
    entity?: Entity | null;
    products: {
        productId: string;
        variantId: string;
        rate: number;
        quantity: number;
    }[];
    discount: number;
    charges: {
        id: string;
        amount: number;
        label: string;
        type: "fixed" | "percentage";
        isVat?: boolean;
        percentage: number;
        bearedByEntity: boolean;
    }[];
    payments: { amount: number; accountId: string; details: object }[];
}

interface EditOrderFormProps {
    type: "BUY" | "SELL";
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<Entity | null>;
    onSubmit: (data: object) => Promise<void> | void;
    initialData?: EditOrderFormData | null;
}

export default function EditOrderForm({
    type,
    entities,
    products,
    accounts,
    addEntity,
    onSubmit,
    initialData = null,
}: // onSubmit,
EditOrderFormProps) {
    const [editOrderState, setEditOrderState] = useState<EditOrderFormData>({
        entity: undefined,
        products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
        discount: 0,
        charges: [],
        payments: [],
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        if (initialData) {
            setEditOrderState(initialData);
        }
    }, [initialData]);

    const subTotal = useMemo(() => {
        return editOrderState.products.reduce(
            (sum, p) => sum + p.rate * p.quantity,
            0
        );
    }, [editOrderState.products]);

    const grandTotal = useMemo(() => {
        const total =
            subTotal -
            editOrderState.discount +
            editOrderState.charges.reduce((sum, c) => sum + c.amount, 0);
        return Math.max(total, 0);
    }, [subTotal, editOrderState.discount, editOrderState.charges]);

    const handleSelectEntity = useCallback((entity: Entity | null) => {
        setEditOrderState((prev) => ({
            ...prev,
            entity,
        }));
    }, []);

    const handleUpdateProducts = useCallback(
        (
            products: {
                productId: string;
                variantId: string;
                rate: number;
                quantity: number;
            }[]
        ) => {
            setEditOrderState((prev) => ({
                ...prev,
                products,
            }));
        },
        []
    );

    const handleUpdateDiscount = useCallback((discount: number) => {
        setEditOrderState((prev) => ({
            ...prev,
            discount,
        }));
    }, []);

    const handleUpdateCharges = useCallback(
        (
            charges: {
                id: string;
                amount: number;
                label: string;
                type: "fixed" | "percentage";
                percentage: number;
                bearedByEntity: boolean;
            }[]
        ) => {
            setEditOrderState((prev) => ({
                ...prev,
                charges,
            }));
        },
        []
    );

    const handleUpdatePayments = useCallback(
        (
            payments: { amount: number; accountId: string; details: object }[]
        ) => {
            setEditOrderState((prev) => ({
                ...prev,
                payments,
            }));
        },
        []
    );
    const { orgId } = useOrg();
    const { orderId } = useParams<{ orderId: string }>();

    const handleAddEntity = async (entity: Partial<Entity>) => {
        try {
            const newEntity = await addEntity(entity);
            if (newEntity) {
                setEditOrderState((prev) => ({
                    ...prev,
                    entity: newEntity,
                }));
            }
            handleSelectEntity(newEntity);
        } catch (error) {
            console.error("Error adding entity:", error);
            toast({
                title: "Error adding entity",
                description: "There was an error adding the entity.",
                variant: "destructive",
            });
        }
    };
    const totalPaid = useMemo(() => {
        return editOrderState.payments.reduce(
            (sum, item) => sum + item.amount,
            0
        );
    }, [editOrderState.payments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { entity, products, discount, charges, payments } =
            editOrderState;
        const parsedProducts = products.filter(
            (p) => p.productId !== "" && p.variantId !== ""
        );
        const data = {
            entity,
            products: parsedProducts,
            discount,
            charges,
            type,
            payments,
        };
        if (parsedProducts.length === 0) {
            setError("Please add at least one product.");
            return;
        }
        // if (type == "BUY" && !entity) {
        //     setError("Cant Buy Product without selecting entity");
        //     return;
        // }
        if (!entity && totalPaid !== grandTotal) {
            setError("Select Entity for unpaid order.");
            return;
        }
        setLoading(true);
        try {
            console.log(data);
            await onSubmit(data);

            setEditOrderState({
                entity: null,
                products: [
                    { productId: "", variantId: "", rate: 0, quantity: 1 },
                ],
                discount: 0,
                charges: [],
                payments: [],
            });

            toast({
                title: "Order updated successfully",
                description: "Your order has been updated.",
            });
        } catch (error) {
            console.error("Error updating order:", error);
            toast({
                title: "Error updating order",
                description: "There was an error updating your order.",
                variant: "destructive",
            });
        }
        setLoading(false);
        setError(null);
    };

    return (
        <div className="p-6 bg-white">
            <div className="mb-6 flex items-center justify-between">
                <div className="">
                    <h2 className="text-2xl font-semibold">Edit Order</h2>
                    <p className="text-muted-foreground mb-8">
                        Modify the order details below.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link
                        to={`/org/${orgId}/orders/${orderId}`}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Button variant="link" className="flex items-center">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Order
                        </Button>
                    </Link>
                </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <EntitySelector
                    entities={entities}
                    onAddEntity={handleAddEntity}
                    selectedEntity={editOrderState.entity || null}
                    onSelectEntity={handleSelectEntity}
                />

                <ProductDetails
                    type={type}
                    products={products}
                    onUpdateProducts={handleUpdateProducts}
                    addedProducts={editOrderState.products}
                />

                <CalculationSelector
                    subTotal={subTotal}
                    discount={editOrderState.discount}
                    setDiscount={handleUpdateDiscount}
                    charges={editOrderState.charges}
                    setCharge={handleUpdateCharges}
                />

                <PaymentSelector
                    selectedPayments={editOrderState.payments}
                    setSelectedPayments={handleUpdatePayments}
                    accounts={accounts}
                    type={type}
                    grandTotal={grandTotal}
                />

                {/* <BillUpload
                    files={[]}
                    onUpload={(files) => dispatch({ type: "SET_BILL_FILES", payload: files })}
                    onRemove={(index) => dispatch({ type: "REMOVE_BILL_FILE", payload: index })}
                /> */}

                {/* {state.error && (
                    <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-600 rounded">
                        {state.error}
                    </div>
                )} */}
                <div className="mb-4">
                    {error && (
                        <div className="p-3 border border-red-500 bg-red-50 text-red-600 rounded relative">
                            {error}
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                onClick={() => setError(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mb-4">
                    {/* clear button */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setEditOrderState({
                                products: [
                                    {
                                        productId: "",
                                        variantId: "",
                                        rate: 0,
                                        quantity: 1,
                                    },
                                ],
                                discount: 0,
                                charges: [],
                                payments: [],
                                entity: null,
                            });
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear
                    </Button>

                    <Button
                        type="submit"
                        className="py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : `Update Order`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
