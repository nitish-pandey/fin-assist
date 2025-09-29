"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Entity, Product, Account, Order } from "@/data/types";
import { ProductDetails, validateProductQuantities } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import EntitySelector from "../modules/entity-selector";
import PaymentSelector from "../modules/payment-selector";
import CalculationSelector from "../modules/calculation-selector";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";
import { Switch } from "../ui/switch";
import { validateAccountBalances } from "@/utils/validation";
import { BalanceSummary } from "../modules/balance-summary";
// import BillUpload from "../modules/bill-upload";

interface OrderProduct {
    productId: string;
    variantId: string;
    rate: number;
    quantity: number;
    description: string;
}

interface OrderCharge {
    id: string;
    amount: number;
    label: string;
    isVat?: boolean;
    type: "fixed" | "percentage";
    percentage: number;
    bearedByEntity: boolean;
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
    description: string;
}

interface BuyProductFormProps {
    type: "BUY" | "SELL";
    entities: Entity[];
    products: Product[];
    accounts: Account[];
    addEntity: (entity: Partial<Entity>) => Promise<Entity | null>;
    onSubmit: (data: object) => Promise<Order> | void;
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
    return charges
        .filter((charge) => charge.bearedByEntity === true)
        .reduce((sum, charge) => {
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

const calculateRemainingAmount = (grandTotal: number, totalPaid: number): number => {
    return Math.max(grandTotal - totalPaid, 0);
};

const AccountSelectionDialog = ({
    accounts,
    onSelect,
    onClose,
    vendorCharges,
}: {
    accounts: Account[];
    onSelect: (account: Account) => void;
    onClose: () => void;
    vendorCharges: number;
}) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <h2 className="text-xl font-semibold">Select an Account</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Choose an account to process vendor charges of Rs {vendorCharges.toFixed(2)}
                    </p>
                </DialogHeader>
                <div className="mt-4 max-h-[300px] overflow-y-auto">
                    <ul className="space-y-2">
                        {accounts.map((account) => {
                            const hasInsufficientBalance = account.balance < vendorCharges;
                            return (
                                <li
                                    key={account.id}
                                    onClick={() => !hasInsufficientBalance && onSelect(account)}
                                    className={`flex items-center p-3 rounded-md border transition-colors ${
                                        hasInsufficientBalance
                                            ? "border-red-200 bg-red-50 hover:bg-red-100 cursor-not-allowed"
                                            : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{account.name}</h3>
                                            {hasInsufficientBalance && (
                                                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                                    Insufficient
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {account.type}
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    hasInsufficientBalance
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                Balance: Rs {account.balance.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant={hasInsufficientBalance ? "destructive" : "ghost"}
                                        size="sm"
                                        className="ml-2"
                                        disabled={hasInsufficientBalance}
                                    >
                                        {hasInsufficientBalance ? "Cannot Select" : "Select"}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
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
    const { orgId } = useOrg();
    // const [formData, setFormData] = useState<OrderFormData>(() =>
    //     createInitialState(type, orgId, defaultEntity)
    // );
    const [orderDate, setOrderDate] = useState<Date | null>(new Date());
    const { buyCart, updateBuyCart, sellCart, updateSellCart } = useOrg();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAccountSelectionActive, setIsAccountSelectionActive] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [currentStep, setCurrentStep] = useState<"details" | "payment" | "summary">("details");
    // Use the correct cart and updater based on type
    const formData = useMemo(
        () => (type === "BUY" ? buyCart : sellCart),
        [type, buyCart, sellCart]
    );
    const setFormData = useMemo(
        () => (type === "BUY" ? updateBuyCart : updateSellCart),
        [type, updateBuyCart, updateSellCart]
    );

    // Toast hook for notifications

    const { toast } = useToast();

    // Update state when defaultEntity changes, but only if no entity is currently selected
    useEffect(() => {
        if (defaultEntity && !formData.entity) {
            setFormData({
                ...formData,
                entity: defaultEntity,
            });
        }
    }, [defaultEntity, formData.entity, setFormData]);

    // Save to localStorage whenever formData changes
    // useEffect(() => {
    //     localStorage.setItem(
    //         `order-${orgId}-${type}`,
    //         JSON.stringify(formData)
    //     );
    // }, [formData, type]);

    // Helper function to get product and variant details for display
    const getProductDetails = (productId: string, variantId: string) => {
        const product = products.find((p) => p.id === productId);
        const variant = product?.variants?.find((v) => v.id === variantId);
        return {
            productName: product?.name || "Unknown Product",
            variantName: variant?.name || "Unknown Variant",
            unit: "Unit",
        };
    };

    // Memoized calculations
    const calculations = useMemo(() => {
        const subTotal = calculateSubTotal(formData.products);
        const chargeAmount = calculateChargeAmount(subTotal, formData.discount, formData.charges);
        const grandTotal = calculateGrandTotal(subTotal, formData.discount, formData.charges);
        const totalPaid = calculateTotalPaid(formData.payments);
        const remainingAmount = calculateRemainingAmount(grandTotal, totalPaid);

        const vendorCharges = formData.charges
            .filter((charge) => charge.bearedByEntity === false)
            .reduce((sum, charge) => {
                let chargeAmount = 0;
                if (charge.type === "percentage") {
                    chargeAmount = (subTotal * charge.percentage) / 100;
                } else {
                    chargeAmount = charge.amount;
                }
                return sum + (isNaN(chargeAmount) ? 0 : chargeAmount);
            }, 0);

        return {
            subTotal,
            chargeAmount,
            grandTotal,
            totalPaid,
            remainingAmount,
            vendorCharges,
        };
    }, [formData.products, formData.discount, formData.charges, formData.payments]);

    useEffect(() => {
        if (defaultEntity && type === "SELL") {
            const defaultPayments = accounts.find((acc) => acc.type === "CASH_COUNTER")
                ? [
                      {
                          amount: calculations.grandTotal,
                          accountId: accounts.find((acc) => acc.type === "CASH_COUNTER")?.id || "",
                          details: {},
                      },
                  ]
                : [];
            setFormData({
                ...formData,
                payments: defaultPayments,
            });
        }
    }, [type, defaultEntity, calculations.grandTotal]);

    // State update functions
    const updateFormData = (updates: Partial<OrderFormData>) => {
        setFormData({
            ...formData,
            ...updates,
        });
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
            products: [{ productId: "", variantId: "", rate: 0, quantity: 1, description: "" }],
            discount: 0,
            charges: [],
            payments: [],
            description: "",
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

        // Add stock validation for sell orders
        if (type === "SELL") {
            const stockValidation = validateProductQuantities(type, products, formData.products);
            if (!stockValidation.isValid) {
                return `Stock validation failed: ${stockValidation.errors.join(", ")}`;
            }
        }

        return null;
    };

    const validatePaymentForm = (): string | null => {
        if (!formData.entity && calculations.remainingAmount > 0) {
            return "Select Entity for unpaid order.";
        }

        // For BUY orders, validate account balances using the utility function
        if (type === "BUY") {
            const balanceValidation = validateAccountBalances(formData.payments, accounts, type);
            if (!balanceValidation.isValid) {
                return balanceValidation.errors[0]; // Return the first error for display
            }
        }

        return null;
    };

    const handleContinueToPayment = () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        setCurrentStep("payment");
        setError(null);
    };

    const handleContinueToSummary = () => {
        const validationError = validatePaymentForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        setCurrentStep("summary");
        setError(null);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If we're not on the summary step, just continue to next step
        if (currentStep !== "summary") {
            return;
        }

        if (calculations.vendorCharges > 0 && !selectedAccount) {
            setIsAccountSelectionActive(true);
            return;
        }

        // Final balance validation for BUY orders before submission
        if (type === "BUY") {
            const balanceValidationError = validatePaymentForm();
            if (balanceValidationError) {
                setError(balanceValidationError);
                return;
            }

            // Validate vendor charges account balance
            if (calculations.vendorCharges > 0 && selectedAccount) {
                if (selectedAccount.balance < calculations.vendorCharges) {
                    setError(
                        `Insufficient balance in ${
                            selectedAccount.name
                        } for vendor charges. Available: Rs ${selectedAccount.balance.toFixed(
                            2
                        )}, Required: Rs ${calculations.vendorCharges.toFixed(2)}`
                    );
                    return;
                }
            }
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
                type === "SELL" &&
                accounts.find((acc) => acc.type === "CASH_COUNTER")
                    ? [
                          {
                              amount: calculations.grandTotal,
                              accountId:
                                  accounts.find((acc) => acc.type === "CASH_COUNTER")?.id || "",
                              details: {},
                          },
                      ]
                    : formData.payments;

            const submitData = {
                entityId: formData.entity?.id,
                products: validProducts,
                discount: formData.discount,
                description: formData.description,
                charges: formData.charges.filter(
                    (charge) => charge.amount > 0 && charge.bearedByEntity
                ),
                type,
                payments: finalPayments,
                orderDate: orderDate || new Date(),
            };

            const createdOrder = await onSubmit(submitData);
            if (createdOrder && selectedAccount && calculations.vendorCharges > 0) {
                await api.post(`/orgs/${orgId}/accounts/${selectedAccount.id}/transactions`, {
                    amount: calculations.vendorCharges,
                    type: "BUY",
                    description: `Vendor Charges-NBC from order - ${createdOrder.id}`,
                    orderId: createdOrder.id,
                });
            }

            resetForm();
            setCurrentStep("details");
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-semibold">{type} Product</h2>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep === "details"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                            }`}
                        >
                            1
                        </div>
                        <div className="w-8 h-1 bg-gray-300"></div>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep === "payment"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                            }`}
                        >
                            2
                        </div>
                        <div className="w-8 h-1 bg-gray-300"></div>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep === "summary"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                            }`}
                        >
                            3
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {type === "SELL" && (
                        <>
                            <Switch
                                id="public-switch"
                                checked={isPublic}
                                onCheckedChange={(checked) => setIsPublic(checked)}
                            />
                            <label htmlFor="public-switch" className="text-sm">
                                {isPublic ? "Public Sale" : "Private Sale"}
                            </label>
                        </>
                    )}
                </div>
            </div>
            <p className="text-muted-foreground mb-8">
                {currentStep === "details"
                    ? `Add product to ${type.toLowerCase()} and select ${
                          type === "BUY" ? "vendor" : "customer"
                      }.`
                    : currentStep === "payment"
                    ? `Complete payment details for your ${type.toLowerCase()} order.`
                    : `Review and confirm your ${type.toLowerCase()} order details.`}
            </p>

            {currentStep === "details" ? (
                // Step 1: Order Details
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleContinueToPayment();
                    }}
                >
                    <EntitySelector
                        entities={entities}
                        onAddEntity={handleAddEntity}
                        selectedEntity={formData.entity}
                        onSelectEntity={handleSelectEntity}
                        type={type === "BUY" ? "vendor" : "merchant"}
                    />

                    <ProductDetails
                        type={type}
                        isPublic={isPublic}
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

                        <Button type="submit" className="py-6 text-lg">
                            Continue to Payment
                        </Button>
                    </div>
                </form>
            ) : currentStep === "payment" ? (
                // Step 2: Payment
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleContinueToSummary();
                    }}
                >
                    <PaymentSelector
                        selectedPayments={formData.payments}
                        setSelectedPayments={handleUpdatePayments}
                        accounts={accounts}
                        grandTotal={calculations.grandTotal}
                        type={type}
                    />

                    {/* Balance Summary for BUY orders */}
                    {type === "BUY" && formData.payments.length > 0 && (
                        <BalanceSummary
                            payments={formData.payments}
                            accounts={accounts}
                            orderType={type}
                        />
                    )}

                    {/* Order Description */}
                    <div className="space-y-2">
                        <label
                            htmlFor="orderDescription"
                            className="text-sm font-medium text-gray-700"
                        >
                            Order Description
                        </label>
                        <Textarea
                            id="orderDescription"
                            placeholder="Enter order description, notes, or special instructions..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="orderDate" className="text-sm font-medium text-gray-700">
                            Order Date
                        </label>
                        <input
                            type="date"
                            id="orderDate"
                            value={orderDate ? orderDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => setOrderDate(new Date(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

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
                                <span>+₹{calculations.chargeAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {calculations.vendorCharges > 0 && (
                            <div className="flex justify-between items-center text-sm mb-2 text-purple-600">
                                <span>Vendor Charges:</span>
                                <span>+₹{calculations.vendorCharges.toFixed(2)}</span>
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
                                <span>₹{calculations.remainingAmount.toFixed(2)}</span>
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
                            onClick={() => setCurrentStep("details")}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Back to Details
                        </Button>

                        <Button type="submit" className="py-6 text-lg">
                            Continue to Summary
                        </Button>
                    </div>
                </form>
            ) : (
                // Step 3: Summary & Confirmation
                <div className="space-y-6">
                    {/* Bill-like Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {/* Header */}
                        <div className="text-center border-b pb-4 mb-6">
                            <h3 className="text-xl font-bold">{type} ORDER SUMMARY</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date().toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>

                        {/* Entity Details */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-2">
                                {type === "BUY" ? "Vendor Details" : "Customer Details"}
                            </h4>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="font-medium">{formData.entity?.name || "N/A"}</p>
                                {formData.entity?.phone && (
                                    <p className="text-sm text-gray-600">
                                        Phone: {formData.entity.phone}
                                    </p>
                                )}
                                {formData.entity?.email && (
                                    <p className="text-sm text-gray-600">
                                        Email: {formData.entity.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Description */}
                        {formData.description && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    Order Description
                                </h4>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {formData.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Products Table */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-3">Products</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 font-medium text-gray-700">
                                                Item
                                            </th>
                                            <th className="text-right py-2 font-medium text-gray-700">
                                                Qty
                                            </th>
                                            <th className="text-right py-2 font-medium text-gray-700">
                                                Rate
                                            </th>
                                            <th className="text-right py-2 font-medium text-gray-700">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.products
                                            .filter((p) => p.productId !== "" && p.variantId !== "")
                                            .map((product, index) => {
                                                const details = getProductDetails(
                                                    product.productId,
                                                    product.variantId
                                                );
                                                const amount = product.rate * product.quantity;
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-gray-100"
                                                    >
                                                        <td className="py-2">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {details.productName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {details.variantName}
                                                                </p>
                                                                {product.description && (
                                                                    <p className="text-xs text-gray-600 mt-1 italic">
                                                                        {product.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-2">
                                                            {product.quantity} {details.unit}
                                                        </td>
                                                        <td className="text-right py-2">
                                                            ₹{product.rate.toFixed(2)}
                                                        </td>
                                                        <td className="text-right py-2 font-medium">
                                                            ₹{amount.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Calculation Summary */}
                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{calculations.subTotal.toFixed(2)}</span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-₹{formData.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {calculations.chargeAmount > 0 && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>Charges:</span>
                                        <span>+₹{calculations.chargeAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {calculations.vendorCharges > 0 && (
                                    <div className="flex justify-between text-purple-600">
                                        <span>Vendor Charges:</span>
                                        <span>+₹{calculations.vendorCharges.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Grand Total:</span>
                                    <span>₹{calculations.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        {formData.payments.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-semibold text-gray-700 mb-3">
                                    Payment Details
                                </h4>
                                <div className="space-y-2">
                                    {formData.payments.map((payment, index) => {
                                        const account = accounts.find(
                                            (acc) => acc.id === payment.accountId
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between bg-gray-50 p-2 rounded"
                                            >
                                                <span className="text-sm">
                                                    {account?.name || "Unknown Account"} (
                                                    {account?.type || "Unknown"})
                                                </span>
                                                <span className="font-medium">
                                                    ₹{payment.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total Paid:</span>
                                        <span className="text-blue-600">
                                            ₹{calculations.totalPaid.toFixed(2)}
                                        </span>
                                    </div>
                                    {calculations.remainingAmount > 0 && (
                                        <div className="flex justify-between font-semibold text-red-600">
                                            <span>Remaining Amount:</span>
                                            <span>₹{calculations.remainingAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
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

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep("payment")}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Back to Payment
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            className="py-6 text-lg bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : `Confirm & Create ${type} Order`}
                        </Button>
                    </div>
                </div>
            )}
            {isAccountSelectionActive && (
                <AccountSelectionDialog
                    accounts={accounts}
                    vendorCharges={calculations.vendorCharges}
                    onSelect={(account) => {
                        setSelectedAccount(account);
                        setIsAccountSelectionActive(false);
                        // Create a synthetic event object and directly call handleSubmit
                        handleSubmit({
                            preventDefault: () => {},
                        } as React.FormEvent);
                    }}
                    onClose={() => setIsAccountSelectionActive(false)}
                />
            )}
        </div>
    );
}
