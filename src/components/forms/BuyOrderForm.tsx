"use client";

import { useMemo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Entity, Product, Account } from "@/data/types";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import EntitySelector from "../modules/entity-selector";
import PaymentSelector from "../modules/payment-selector";
import CalculationSelector from "../modules/calculation-selector";
import { X } from "lucide-react";
// import BillUpload from "../modules/bill-upload";

interface BuyProductData {
    entity?: Entity | null;
    products: { productId: string; variantId: string; rate: number; quantity: number }[];
    discount: number;
    charges: { id: string; amount: number; label: string }[];
    payments: { amount: number; accountId: string; details: object }[];
}

interface BuyProductFormProps {
    type: "BUY" | "SELL";
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<void>;
    onSubmit: (data: object) => Promise<void> | void;
}

export default function BuyProductForm({
    type,
    entities,
    products,
    accounts,
    addEntity,
    onSubmit,
}: // onSubmit,
BuyProductFormProps) {
    const [buyState, setBuyState] = useState<BuyProductData>({
        entity: undefined,
        products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
        discount: 0,
        charges: [],
        payments: [],
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();

    const subTotal = useMemo(() => {
        return buyState.products.reduce((sum, p) => sum + p.rate * p.quantity, 0);
    }, [buyState.products]);

    const grandTotal = useMemo(() => {
        const total =
            subTotal - buyState.discount + buyState.charges.reduce((sum, c) => sum + c.amount, 0);
        return Math.max(total, 0);
    }, [subTotal, buyState.discount, buyState.charges]);

    const handleSelectEntity = useCallback((entity: Entity | null) => {
        setBuyState((prev) => ({
            ...prev,
            entity,
        }));
    }, []);

    const handleUpdateProducts = useCallback(
        (products: { productId: string; variantId: string; rate: number; quantity: number }[]) => {
            setBuyState((prev) => ({
                ...prev,
                products,
            }));
        },
        []
    );

    const handleUpdateDiscount = useCallback((discount: number) => {
        setBuyState((prev) => ({
            ...prev,
            discount,
        }));
    }, []);

    const handleUpdateCharges = useCallback(
        (charges: { id: string; amount: number; label: string }[]) => {
            setBuyState((prev) => ({
                ...prev,
                charges,
            }));
        },
        []
    );

    const handleUpdatePayments = useCallback(
        (payments: { amount: number; accountId: string; details: object }[]) => {
            setBuyState((prev) => ({
                ...prev,
                payments,
            }));
        },
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { entity, products, discount, charges, payments } = buyState;
        const parsedProducts = products.filter((p) => p.productId !== "" && p.variantId !== "");
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
        setLoading(true);
        try {
            console.log(data);
            await onSubmit(data);

            setBuyState({
                entity: null,
                products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
                discount: 0,
                charges: [],
                payments: [],
            });

            toast({
                title: "Order created successfully",
                description: "Your order has been created.",
            });
        } catch (error) {
            console.error("Error creating order:", error);
            toast({
                title: "Error creating order",
                description: "There was an error creating your order.",
                variant: "destructive",
            });
        }
        setLoading(false);
        setError(null);
    };

    return (
        <div className="p-6 bg-white">
            <h2 className="text-2xl font-semibold">{type} Product</h2>
            <p className="text-muted-foreground mb-8">
                Add product to buy and select client to buy.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <EntitySelector
                    entities={entities}
                    onAddEntity={addEntity}
                    selectedEntity={buyState.entity || null}
                    onSelectEntity={handleSelectEntity}
                />

                <ProductDetails
                    products={products}
                    onUpdateProducts={handleUpdateProducts}
                    addedProducts={buyState.products}
                />

                <CalculationSelector
                    subTotal={subTotal}
                    discount={buyState.discount}
                    setDiscount={handleUpdateDiscount}
                    charges={buyState.charges}
                    setCharge={handleUpdateCharges}
                />

                <PaymentSelector
                    selectedPayments={buyState.payments}
                    setSelectedPayments={handleUpdatePayments}
                    accounts={accounts}
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
                            setBuyState({
                                products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
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

                    <Button type="submit" className="py-6 text-lg" disabled={loading}>
                        {loading ? "Processing..." : `Create ${type} Order`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
