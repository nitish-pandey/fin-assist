import { Account } from "@/data/types";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";

interface EditAccountFormData {
    name: string;
    accountName: string;
    accountNumber: string;
    interestRate: number;
    limit?: number;
}

interface EditAccountModalProps {
    account: Account | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditAccountModal({ account, isOpen, onClose, onSuccess }: EditAccountModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditAccountFormData>();

    // Reset form when account changes
    useEffect(() => {
        if (account) {
            reset({
                name: account.name,
                accountName: account.details?.bankName,
                accountNumber: account.details?.accountNumber,
                interestRate: account.interestRate || 0,
                limit: account.limit || undefined,
            });
        }
    }, [account, reset]);

    // Only allow editing for BANK and BANK_OD accounts
    const isEditableAccount = account?.type === "BANK" || account?.type === "BANK_OD";

    if (!account || !isEditableAccount) {
        return null;
    }

    const onFormSubmit = async (data: EditAccountFormData) => {
        try {
            setIsSubmitting(true);

            const updateData: Partial<Account> = {
                name: data.name,
                details: {
                    ...account.details,
                    chequeDate: account.details?.chequeDate || null,
                    bankName: data.accountName,
                    accountNumber: data.accountNumber,
                },
                interestRate: Number(data.interestRate),
            };

            // Only include limit for BANK_OD accounts
            if (account.type === "BANK_OD") {
                updateData.limit = data.limit ? Number(data.limit) : null;
            }

            await api.put(`/orgs/${account.organizationId}/accounts/${account.id}`, updateData);

            toast({
                title: "Success",
                description: "Account updated successfully!",
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error updating account:", error);
            toast({
                title: "Error",
                description: "Failed to update account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Account Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Account Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter account name"
                            {...register("name", {
                                required: "Account name is required",
                                minLength: {
                                    value: 2,
                                    message: "Account name must be at least 2 characters",
                                },
                            })}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountName">Bank Name</Label>
                        <Input
                            id="accountName"
                            type="text"
                            placeholder="Enter bank name"
                            {...register("accountName", {
                                required: "Bank name is required",
                                minLength: {
                                    value: 2,
                                    message: "Bank name must be at least 2 characters",
                                },
                            })}
                        />
                        {errors.accountName && (
                            <p className="text-sm text-red-600">{errors.accountName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            type="text"
                            placeholder="Enter account number"
                            {...register("accountNumber", {
                                required: "Account number is required",
                                minLength: {
                                    value: 5,
                                    message: "Account number must be at least 5 characters",
                                },
                            })}
                        />
                        {errors.accountNumber && (
                            <p className="text-sm text-red-600">{errors.accountNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input
                            id="interestRate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Enter interest rate"
                            {...register("interestRate", {
                                required: "Interest rate is required",
                                min: {
                                    value: 0,
                                    message: "Interest rate must be 0 or greater",
                                },
                                max: {
                                    value: 100,
                                    message: "Interest rate cannot exceed 100%",
                                },
                            })}
                        />
                        {errors.interestRate && (
                            <p className="text-sm text-red-600">{errors.interestRate.message}</p>
                        )}
                    </div>

                    {account.type === "BANK_OD" && (
                        <div className="space-y-2">
                            <Label htmlFor="limit">Overdraft Limit</Label>
                            <Input
                                id="limit"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Enter overdraft limit"
                                {...register("limit", {
                                    min: {
                                        value: 0,
                                        message: "Limit must be 0 or greater",
                                    },
                                })}
                            />
                            {errors.limit && (
                                <p className="text-sm text-red-600">{errors.limit.message}</p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
