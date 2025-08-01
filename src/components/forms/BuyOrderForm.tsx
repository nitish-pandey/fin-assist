"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Entity, Product, Account } from "@/data/types";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import EntitySelector from "../modules/entity-selector";
import PaymentSelector from "../modules/payment-selector";
import CalculationSelector from "../modules/calculation-selector";
import { X } from "lucide-react";
// import BillUpload from "../modules/bill-upload";

interface OrderProduct {
    productId: string;
    variantId: string;
    rate: number;
    quantity: number;
}

interface OrderCharge {
    id: string;
    amount: number;
    label: string;
    isVat?: boolean;
    type: "fixed" | "percentage";
    percentage: number;
}

interface OrderPayment {
    amount: number;
    accountId: string;
    details: object;
}

interface OrderFormData {
    entity: Entity | null;
    products: OrderProduct[];
    discount: number;
    charges: OrderCharge[];
    payments: OrderPayment[];
}

interface BuyProductFormProps {
    type: "BUY" | "SELL";
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<Entity | null>;
    onSubmit: (data: object) => Promise<void> | void;
    defaultEntity?: Entity | null;
}

// Helper functions for calculations
const calculateSubTotal = (products: OrderProduct[]): number => {
    return products.reduce((sum, product) => {
        const amount = product.rate * product.quantity;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
};

const calculateChargeAmount = (
    subTotal: number,
    discount: number,
    charges: OrderCharge[]
): number => {
    const baseAmount = subTotal - discount;
    return charges.reduce((sum, charge) => {
        let chargeAmount = 0;
        if (charge.type === "percentage") {
            chargeAmount = (baseAmount * charge.percentage) / 100;
        } else {
            chargeAmount = charge.amount;
        }
        return sum + (isNaN(chargeAmount) ? 0 : chargeAmount);
    }, 0);
};

const calculateGrandTotal = (
    subTotal: number,
    discount: number,
    charges: OrderCharge[]
): number => {
    const chargeAmount = calculateChargeAmount(subTotal, discount, charges);
    const total = subTotal - discount + chargeAmount;
    return Math.max(total, 0);
};

const calculateTotalPaid = (payments: OrderPayment[]): number => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
};

const calculateRemainingAmount = (
    grandTotal: number,
    totalPaid: number
): number => {
    return Math.max(grandTotal - totalPaid, 0);
};

// Initial state factory
const createInitialState = (
    type: string,
    defaultEntity: Entity | null
): OrderFormData => {
    // Try to get saved state from localStorage
    const savedState = localStorage.getItem(`order-${type}`);
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            return {
                entity: defaultEntity || parsed.entity || null,
                products: parsed.products || [
                    { productId: "", variantId: "", rate: 0, quantity: 1 },
                ],
                discount: parsed.discount || 0,
                charges: parsed.charges || [],
                payments: parsed.payments || [],
            };
        } catch (error) {
            console.error("Failed to parse saved state:", error);
        }
    }

    return {
        entity: defaultEntity,
        products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
        discount: 0,
        charges: [],
        payments: [],
    };
};

export default function BuyProductForm({
    type,
    entities,
    products,
    accounts,
    addEntity,
    onSubmit,
    defaultEntity = null,
}: BuyProductFormProps) {
    const [formData, setFormData] = useState<OrderFormData>(() =>
        createInitialState(type, defaultEntity)
    );
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();

    // Update state when defaultEntity changes
    useEffect(() => {
        if (defaultEntity && defaultEntity !== formData.entity) {
            setFormData((prev) => ({ ...prev, entity: defaultEntity }));
        }
    }, [defaultEntity, formData.entity]);

    // Save to localStorage whenever formData changes
    useEffect(() => {
        localStorage.setItem(`order-${type}`, JSON.stringify(formData));
    }, [formData, type]);

    // Memoized calculations
    const calculations = useMemo(() => {
        const subTotal = calculateSubTotal(formData.products);
        const chargeAmount = calculateChargeAmount(
            subTotal,
            formData.discount,
            formData.charges
        );
        const grandTotal = calculateGrandTotal(
            subTotal,
            formData.discount,
            formData.charges
        );
        const totalPaid = calculateTotalPaid(formData.payments);
        const remainingAmount = calculateRemainingAmount(grandTotal, totalPaid);

        return {
            subTotal,
            chargeAmount,
            grandTotal,
            totalPaid,
            remainingAmount,
        };
    }, [
        formData.products,
        formData.discount,
        formData.charges,
        formData.payments,
    ]);

    // State update functions
    const updateFormData = (updates: Partial<OrderFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        setError(null);
    };

    const handleSelectEntity = (entity: Entity | null) => {
        updateFormData({ entity });
    };

    const handleUpdateProducts = (products: OrderProduct[]) => {
        updateFormData({ products });
    };

    const handleUpdateDiscount = (discount: number) => {
        updateFormData({ discount: isNaN(discount) ? 0 : discount });
    };

    const handleUpdateCharges = (charges: OrderCharge[]) => {
        updateFormData({ charges });
    };

    const handleUpdatePayments = (payments: OrderPayment[]) => {
        updateFormData({ payments });
    };

    const handleAddEntity = async (entity: Partial<Entity>) => {
        try {
            const newEntity = await addEntity(entity);
            if (newEntity) {
                updateFormData({ entity: newEntity });
                toast({
                    title: "Entity added successfully",
                    description: "The entity has been added and selected.",
                });
            }
        } catch (error) {
            console.error("Error adding entity:", error);
            toast({
                title: "Error adding entity",
                description: "There was an error adding the entity.",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        const resetData: OrderFormData = {
            entity: null,
            products: [{ productId: "", variantId: "", rate: 0, quantity: 1 }],
            discount: 0,
            charges: [],
            payments: [],
        };
        setFormData(resetData);
        setError(null);
    };

    const validateForm = (): string | null => {
        const validProducts = formData.products.filter(
            (p) => p.productId !== "" && p.variantId !== ""
        );

        if (validProducts.length === 0) {
            return "Please add at least one product.";
        }

        if (!formData.entity && calculations.remainingAmount > 0) {
            return "Select Entity for unpaid order.";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const validProducts = formData.products.filter(
                (p) => p.productId !== "" && p.variantId !== ""
            );

            // Determine payments - use cash counter for default entities, otherwise use selected payments
            const finalPayments =
                formData.entity?.isDefault &&
                accounts.find((acc) => acc.type === "CASH_COUNTER")
                    ? [
                          {
                              amount: calculations.grandTotal,
                              accountId:
                                  accounts.find(
                                      (acc) => acc.type === "CASH_COUNTER"
                                  )?.id || "",
                              details: {},
                          },
                      ]
                    : formData.payments;

            const submitData = {
                entity: formData.entity,
                products: validProducts,
                discount: formData.discount,
                charges: formData.charges,
                type,
                payments: finalPayments,
            };

            console.log("Submitting order data:", submitData);
            await onSubmit(submitData);

            resetForm();
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white">
            <h2 className="text-2xl font-semibold">{type} Product</h2>
            <p className="text-muted-foreground mb-8">
                Add product to {type.toLowerCase()} and select{" "}
                {type === "BUY" ? "vendor" : "customer"}.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <EntitySelector
                    entities={entities}
                    onAddEntity={handleAddEntity}
                    selectedEntity={formData.entity}
                    onSelectEntity={handleSelectEntity}
                    type={type === "BUY" ? "vendor" : "merchant"}
                />

                <ProductDetails
                    products={products}
                    onUpdateProducts={handleUpdateProducts}
                    addedProducts={formData.products}
                />

                <CalculationSelector
                    subTotal={calculations.subTotal}
                    discount={formData.discount}
                    setDiscount={handleUpdateDiscount}
                    charges={formData.charges}
                    setCharge={handleUpdateCharges}
                />

                {!formData.entity?.isDefault && (
                    <PaymentSelector
                        selectedPayments={formData.payments}
                        setSelectedPayments={handleUpdatePayments}
                        accounts={accounts}
                        grandTotal={calculations.grandTotal}
                        type={type}
                    />
                )}

                {/* Display calculation summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span>Subtotal:</span>
                        <span>₹{calculations.subTotal.toFixed(2)}</span>
                    </div>
                    {formData.discount > 0 && (
                        <div className="flex justify-between items-center text-sm mb-2 text-green-600">
                            <span>Discount:</span>
                            <span>-₹{formData.discount.toFixed(2)}</span>
                        </div>
                    )}
                    {calculations.chargeAmount > 0 && (
                        <div className="flex justify-between items-center text-sm mb-2 text-orange-600">
                            <span>Charges:</span>
                            <span>
                                +₹{calculations.chargeAmount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center font-semibold border-t pt-2">
                        <span>Grand Total:</span>
                        <span>₹{calculations.grandTotal.toFixed(2)}</span>
                    </div>
                    {calculations.totalPaid > 0 && (
                        <div className="flex justify-between items-center text-sm mt-2 text-blue-600">
                            <span>Total Paid:</span>
                            <span>₹{calculations.totalPaid.toFixed(2)}</span>
                        </div>
                    )}
                    {calculations.remainingAmount > 0 && (
                        <div className="flex justify-between items-center text-sm mt-1 text-red-600 font-medium">
                            <span>Remaining:</span>
                            <span>
                                ₹{calculations.remainingAmount.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

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

                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear Form
                    </Button>

                    <Button
                        type="submit"
                        className="py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : `Create ${type} Order`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
