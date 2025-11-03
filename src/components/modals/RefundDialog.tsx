"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, Order } from "@/data/types";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { api } from "@/utils/api";

interface RefundDialogProps {
    order: Order;
    accounts: Account[];
    orgId: string;
    onRefundSuccess?: () => void;
}

export default function RefundDialog({
    order,
    accounts,
    orgId,
    onRefundSuccess,
}: RefundDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Record<string, { qty: number; rate: number }>>({});
    const [accountId, setAccountId] = useState("");
    const [charges, setCharges] = useState<{ label: string; amount: number }[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [note, setNote] = useState("");
    const [refundDate, setRefundDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState<string | null>(null);

    // Calculate total paid and remaining amount
    const totalPaid = order.transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const remainingToPay = order.totalAmount - totalPaid;

    // Default refund date: use today's date
    useEffect(() => {
        if (isOpen && order) {
            setRefundDate(new Date().toISOString().split("T")[0]);

            // initialize selected map with zero quantities and existing price
            const initial: Record<string, { qty: number; rate: number }> = {};
            order.items?.forEach((it) => {
                initial[it.id] = { qty: 0, rate: it.price };
            });
            setSelected(initial);

            // Initialize discount and tax from order
            setDiscount(order.discount || 0);
            setTax(order.tax || 0);

            // Initialize charges from order
            if (order.charges && order.charges.length > 0) {
                setCharges(order.charges.map((c) => ({ label: c.label, amount: c.amount })));
            } else {
                setCharges([]);
            }

            // default account to cash if present
            const cash = accounts.find((a) => a.type === "CASH_COUNTER");
            if (cash) setAccountId(cash.id);
        }
    }, [isOpen, order, accounts]);

    const items = order.items || [];

    const totalSelectedAmount = useMemo(() => {
        let sum = 0;
        for (const key of Object.keys(selected)) {
            const s = selected[key];
            if (s && s.qty > 0) sum += s.qty * s.rate;
        }
        return sum;
    }, [selected]);

    const totalCharges = useMemo(
        () => charges.reduce((s, c) => s + Number(c.amount || 0), 0),
        [charges]
    );

    // Calculate original order total
    const originalTotal = order.totalAmount;

    // Calculate remaining items total (original items - refunded items)
    const remainingItemsTotal = useMemo(() => {
        let sum = 0;
        order.items?.forEach((it) => {
            const sel = selected[it.id] || { qty: 0, rate: it.price };
            const remainingQty = it.quantity - sel.qty;
            sum += remainingQty * it.price;
        });
        return sum;
    }, [order.items, selected]);

    // Calculate new order total with remaining items and updated discount/tax/charges
    const newSubtotal = remainingItemsTotal;
    const newTotal = newSubtotal - (discount || 0) + (tax || 0) + totalCharges;

    // Refund amount = original total - new total
    const grossRefund = originalTotal - newTotal;

    // For display purposes
    const refundedItemsSubtotal = totalSelectedAmount;

    // Calculate net refund based on payment status
    // If order is unpaid/partially paid, refund reduces the debt first
    const amountToReduceDebt = Math.min(grossRefund, remainingToPay);
    const amountToCreditAccount = Math.max(0, grossRefund - remainingToPay);
    const netRefund = amountToCreditAccount;

    const setItemQty = (itemId: string, qty: number) => {
        setSelected((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || { rate: 0 }), qty } }));
    };

    const setItemRate = (itemId: string, rate: number) => {
        setSelected((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || { qty: 0 }), rate } }));
    };

    const addCharge = () => setCharges((s) => [...s, { label: "Charge", amount: 0 }]);
    const updateCharge = (idx: number, field: "label" | "amount", value: string) => {
        setCharges((s) =>
            s.map((c, i) =>
                i === idx ? { ...c, [field]: field === "amount" ? Number(value || 0) : value } : c
            )
        );
    };
    const removeCharge = (idx: number) => setCharges((s) => s.filter((_, i) => i !== idx));

    const reset = () => {
        setIsOpen(false);
        setSelected({});
        setAccountId("");
        setCharges([]);
        setDiscount(0);
        setTax(0);
        setNote("");
        setError(null);
    };

    const validateAndSubmit = async () => {
        const selectedItems = Object.keys(selected)
            .map((k) => ({ id: k, qty: selected[k].qty, rate: selected[k].rate }))
            .filter((s) => s.qty > 0);

        if (selectedItems.length === 0) {
            setError("Select at least one product and quantity to refund.");
            return;
        }
        // Only require account if there's actual money to credit back
        if (amountToCreditAccount > 0 && !accountId) {
            setError("Select an account to credit the refund amount.");
            return;
        }

        const payload = {
            items: selectedItems,
            accountId: amountToCreditAccount > 0 ? accountId : undefined,
            charges,
            discount,
            tax,
            note,
            grossRefundAmount: grossRefund,
            amountToReduceDebt,
            amountToCreditAccount,
            refundDate: new Date(refundDate).toISOString(),
        };

        try {
            // Prefer dedicated refunds endpoint
            console.log("Refund payload", payload);
            await api.post(`/orgs/${orgId}/orders/${order.id}/refund`, payload);
            if (onRefundSuccess) onRefundSuccess();
            reset();
        } catch (err) {
            // Fallback: create a transaction of type REFUND
            try {
                // await api.post(`/orgs/${orgId}/transactions`, {
                //     amount: netRefund,
                //     accountId,
                //     orderId: order.id,
                //     type: "REFUND",
                //     description: note,
                //     details: { charges },
                //     createdAt: new Date(refundDate).toISOString(),
                // });
                if (onRefundSuccess) onRefundSuccess();
                reset();
            } catch (err2) {
                console.error("Refund failed", err2);
                setError("Failed to process refund. Please try again.");
            }
        }
    };

    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
                Refund
            </Button>

            <Dialog open={isOpen} onOpenChange={reset}>
                <DialogContent className="sm:max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-auto">
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogHeader className="text-lg font-semibold">Process Refund</DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">
                                Select products and quantities to refund.
                            </p>
                        </div>

                        <div className="col-span-2">
                            <div className="space-y-2 max-h-64 overflow-auto border rounded p-2">
                                {items.length === 0 && <p className="text-sm">No items found.</p>}
                                {items.map((it) => {
                                    const sel = selected[it.id] || { qty: 0, rate: it.price };
                                    return (
                                        <div
                                            key={it.id}
                                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
                                        >
                                            <div className="w-48">
                                                <div className="font-medium">{it.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {it.description || ""}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label>Qty</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={it.quantity}
                                                    value={sel.qty}
                                                    onChange={(e) =>
                                                        setItemQty(
                                                            it.id,
                                                            Number(e.target.value || 0)
                                                        )
                                                    }
                                                    className="w-20"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label>Rate</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={sel.rate}
                                                    onChange={(e) =>
                                                        setItemRate(
                                                            it.id,
                                                            Number(e.target.value || 0)
                                                        )
                                                    }
                                                    className="w-28"
                                                />
                                            </div>
                                            <div className="ml-auto text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    Available: {it.quantity}
                                                </div>
                                                <div className="font-medium">
                                                    Nrs {(sel.qty * sel.rate).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <Label>Refund Date</Label>
                            <Input
                                type="date"
                                value={refundDate}
                                onChange={(e) => setRefundDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>
                                Account to Credit Refund
                                {amountToCreditAccount === 0 && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        (Optional - No credit needed)
                                    </span>
                                )}
                            </Label>
                            <Select value={accountId} onValueChange={(v) => setAccountId(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name} - Rs {a.balance.toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Discount</Label>
                            <Input
                                type="number"
                                min={0}
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value || 0))}
                                placeholder="Enter discount amount"
                            />
                        </div>

                        <div>
                            <Label>Tax/VAT</Label>
                            <Input
                                type="number"
                                min={0}
                                value={tax}
                                onChange={(e) => setTax(Number(e.target.value || 0))}
                                placeholder="Enter tax amount"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Note / Description</Label>
                            <Input value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-center justify-between">
                                <Label>Additional Charges</Label>
                                <Button variant="ghost" size="sm" onClick={addCharge} type="button">
                                    Add Charge
                                </Button>
                            </div>
                            <div className="space-y-2 mt-2">
                                {charges.map((c, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Label"
                                            value={c.label}
                                            onChange={(e) =>
                                                updateCharge(idx, "label", e.target.value)
                                            }
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={c.amount}
                                            onChange={(e) =>
                                                updateCharge(idx, "amount", e.target.value)
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            onClick={() => removeCharge(idx)}
                                            type="button"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <div className="space-y-3 p-4 border rounded bg-muted/20">
                                <div className="text-sm font-semibold mb-2">Refund Calculation</div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Original Order Total
                                    </span>
                                    <span className="font-medium">
                                        Nrs {originalTotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Refunded Items Subtotal
                                    </span>
                                    <span className="font-medium text-amber-600">
                                        Nrs {refundedItemsSubtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Remaining Items Subtotal
                                    </span>
                                    <span className="font-medium">
                                        Nrs {remainingItemsTotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="border-t pt-2 space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>New Discount</span>
                                        <span>-Nrs {(discount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>New Tax/VAT</span>
                                        <span>+Nrs {(tax || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>New Charges</span>
                                        <span>+Nrs {totalCharges.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">New Order Total</span>
                                    <span className="font-medium">Nrs {newTotal.toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-2 flex justify-between">
                                    <span className="font-semibold">Gross Refund Amount</span>
                                    <span className="font-semibold text-green-600">
                                        Nrs {grossRefund.toFixed(2)}
                                    </span>
                                </div>

                                {remainingToPay > 0 && (
                                    <>
                                        <div className="mt-3 pt-3 border-t space-y-2">
                                            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                                <div className="font-medium mb-1">
                                                    ⚠️ Order Not Fully Paid
                                                </div>
                                                <div className="text-xs">
                                                    Remaining to pay: Nrs{" "}
                                                    {remainingToPay.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Amount to Reduce Debt
                                                </span>
                                                <span className="font-medium text-amber-600">
                                                    Nrs {amountToReduceDebt.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Amount to Credit to Account
                                                </span>
                                                <span className="font-medium text-green-600">
                                                    Nrs {amountToCreditAccount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                    <span className="text-lg font-bold">Net Refund to Account</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        Nrs {netRefund.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="col-span-2 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={reset} type="button">
                            Cancel
                        </Button>
                        <Button onClick={validateAndSubmit} type="button">
                            Process Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
