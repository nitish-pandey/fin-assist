"use client";

import React, { useReducer, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Entity, Product, Account } from "@/data/types";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import EntitySelector from "../modules/entity-selector";
import PaymentSelector from "../modules/payment-selector";
import CalculationSelector from "../modules/calculation-selector";
import BillUpload from "../modules/bill-upload";

interface BuyProductFormProps {
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<void>;
    onSubmit: (
        products: { id: string; rate: number; quantity: number }[],
        payments: { amount: number; accountId: string; details: object }[],
        entityId: string,
        billFiles: File[],
        discount: number,
        tax: number,
        charge: number
    ) => Promise<void> | void;
}

type State = {
    selectedEntity: Entity | null;
    selectedProducts: { id: string; quantity: number; rate: number }[];
    selectedPayments: { amount: number; accountId: string; details: object }[];
    billFiles: File[];
    discount: number;
    charge: number;
    loading: boolean;
    error: string | null;
};

type Action =
    | { type: "SET_ENTITY"; payload: Entity | null }
    | { type: "SET_PRODUCTS"; payload: State["selectedProducts"] }
    | { type: "SET_PAYMENTS"; payload: State["selectedPayments"] }
    | { type: "SET_BILL_FILES"; payload: File[] }
    | { type: "REMOVE_BILL_FILE"; payload: number }
    | { type: "SET_DISCOUNT"; payload: number }
    | { type: "SET_CHARGE"; payload: number }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "RESET_FORM" };

const initialState: State = {
    selectedEntity: null,
    selectedProducts: [],
    selectedPayments: [],
    billFiles: [],
    discount: 0,
    charge: 0,
    loading: false,
    error: null,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_ENTITY":
            return { ...state, selectedEntity: action.payload };
        case "SET_PRODUCTS":
            return { ...state, selectedProducts: action.payload };
        case "SET_PAYMENTS":
            return { ...state, selectedPayments: action.payload };
        case "SET_BILL_FILES":
            return { ...state, billFiles: action.payload };
        case "REMOVE_BILL_FILE":
            return {
                ...state,
                billFiles: state.billFiles.filter((_, i) => i !== action.payload),
            };
        case "SET_DISCOUNT":
            return { ...state, discount: action.payload };
        case "SET_CHARGE":
            return { ...state, charge: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "RESET_FORM":
            return initialState;
        default:
            return state;
    }
}

export default function BuyProductForm({
    entities,
    products,
    accounts,
    addEntity,
    onSubmit,
}: BuyProductFormProps) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { toast } = useToast();

    const totalProductPrice = useMemo(() => {
        return state.selectedProducts.reduce((acc, prod) => {
            return acc + prod.quantity * (prod.rate || 0);
        }, 0);
    }, [state.selectedProducts, products]);

    const tax = 0;

    const totalPayments = useMemo(() => {
        return state.selectedPayments.reduce((sum, p) => sum + p.amount, 0);
    }, [state.selectedPayments]);

    const remainingAmount = useMemo(
        () => totalProductPrice - totalPayments - state.discount + tax + state.charge,
        [totalProductPrice, totalPayments]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            dispatch({ type: "SET_ERROR", payload: null });

            if (!state.selectedEntity) {
                return dispatch({ type: "SET_ERROR", payload: "Please select an entity." });
            }

            const validProducts = state.selectedProducts.filter((p) => p.id && p.quantity > 0);

            if (validProducts.length === 0) {
                return dispatch({
                    type: "SET_ERROR",
                    payload: "Please select at least one valid product.",
                });
            }

            dispatch({ type: "SET_LOADING", payload: true });

            try {
                await onSubmit(
                    validProducts,
                    state.selectedPayments,
                    state.selectedEntity.id,
                    state.billFiles,
                    state.discount,
                    tax,
                    state.charge
                );

                dispatch({ type: "RESET_FORM" });

                toast({
                    title: "Purchase Successful",
                    description: "The product has been purchased successfully.",
                });
            } catch (err) {
                dispatch({
                    type: "SET_ERROR",
                    payload: "An error occurred during submission. Please try again.",
                });
            }

            dispatch({ type: "SET_LOADING", payload: false });
        },
        [state, onSubmit, toast, tax]
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold">Buy Product</h2>
            <p className="text-muted-foreground mb-8">
                Add product to buy and select client to buy.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <EntitySelector
                    entities={entities}
                    selectedEntityId={state.selectedEntity?.id}
                    onSelectEntity={(id) =>
                        dispatch({
                            type: "SET_ENTITY",
                            payload: entities.find((e) => e.id === id) || null,
                        })
                    }
                    onAddEntity={addEntity}
                />

                <ProductDetails
                    products={products}
                    onUpdateProducts={(products) =>
                        dispatch({ type: "SET_PRODUCTS", payload: products })
                    }
                />

                <CalculationSelector
                    subTotal={totalProductPrice}
                    discount={state.discount}
                    charge={state.charge}
                    setDiscount={(d) => dispatch({ type: "SET_DISCOUNT", payload: d })}
                    setCharge={(c) => dispatch({ type: "SET_CHARGE", payload: c })}
                />

                <PaymentSelector
                    selectedPayments={state.selectedPayments}
                    setSelectedPayments={(payments) =>
                        dispatch({ type: "SET_PAYMENTS", payload: payments })
                    }
                    accounts={accounts}
                    remainingAmount={remainingAmount}
                />

                <BillUpload
                    files={state.billFiles}
                    onUpload={(files) => dispatch({ type: "SET_BILL_FILES", payload: files })}
                    onRemove={(index) => dispatch({ type: "REMOVE_BILL_FILE", payload: index })}
                />

                {state.error && (
                    <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-600 rounded">
                        {state.error}
                    </div>
                )}

                <Button type="submit" className="w-full py-6 text-lg" disabled={state.loading}>
                    {state.loading ? "Processing..." : "Create Order"}
                </Button>
            </form>
        </div>
    );
}
