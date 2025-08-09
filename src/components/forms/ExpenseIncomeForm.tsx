import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";
import { Account, Entity } from "@/data/types";
import {
    TransactionCategory,
    RecurrenceType,
    CreateExpenseIncomeData,
} from "@/data/expense-income-types";

interface ExpenseIncomeFormProps {
    isExpense: boolean;
    onSubmit: (data: CreateExpenseIncomeData) => Promise<void>;
    onCancel: () => void;
    initialData?: Partial<CreateExpenseIncomeData>;
}

const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
    { value: "OFFICE_RENT", label: "Office Rent" },
    { value: "EMPLOYEE_SALARY", label: "Employee Salary" },
    { value: "UTILITY_BILLS", label: "Utility Bills" },
    { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
    { value: "TRAVEL_EXPENSE", label: "Travel Expense" },
    { value: "MARKETING_ADVERTISING", label: "Marketing & Advertising" },
    { value: "PROFESSIONAL_FEES", label: "Professional Fees" },
    { value: "EQUIPMENT_MAINTENANCE", label: "Equipment Maintenance" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "TAXES", label: "Taxes" },
    { value: "DONATIONS_GIVEN", label: "Donations Given" },
    { value: "INTEREST_PAID", label: "Interest Paid" },
    { value: "DEPRECIATION", label: "Depreciation" },
    { value: "MISCELLANEOUS_EXPENSE", label: "Miscellaneous Expense" },
];

const INCOME_CATEGORIES: { value: TransactionCategory; label: string }[] = [
    { value: "SERVICE_INCOME", label: "Service Income" },
    { value: "CONSULTING_INCOME", label: "Consulting Income" },
    { value: "RENTAL_INCOME", label: "Rental Income" },
    { value: "INTEREST_RECEIVED", label: "Interest Received" },
    { value: "DONATIONS_RECEIVED", label: "Donations Received" },
    { value: "COMMISSION_INCOME", label: "Commission Income" },
    { value: "DIVIDEND_INCOME", label: "Dividend Income" },
    { value: "CAPITAL_GAINS", label: "Capital Gains" },
    { value: "MISCELLANEOUS_INCOME", label: "Miscellaneous Income" },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
    { value: "NONE", label: "No Recurrence" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
];

export default function ExpenseIncomeForm({
    isExpense,
    onSubmit,
    onCancel,
    initialData,
}: ExpenseIncomeFormProps) {
    const { orgId } = useOrg();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [newTag, setNewTag] = useState("");

    const [formData, setFormData] = useState<CreateExpenseIncomeData>({
        amount: initialData?.amount || 0,
        description: initialData?.description || "",
        category: initialData?.category || (isExpense ? "MISCELLANEOUS_EXPENSE" : "MISCELLANEOUS_INCOME"),
        isExpense,
        accountId: initialData?.accountId || "",
        entityId: initialData?.entityId,
        tags: initialData?.tags || [],
        notes: initialData?.notes || "",
        isRecurring: initialData?.isRecurring || false,
        recurrenceType: initialData?.recurrenceType || "NONE",
        recurrenceInterval: initialData?.recurrenceInterval || 1,
        endDate: initialData?.endDate || "",
    });

    // Load accounts and entities
    useEffect(() => {
        const loadData = async () => {
            try {
                const [accountsRes, entitiesRes] = await Promise.all([
                    api.get<Account[]>(`/orgs/${orgId}/accounts`),
                    api.get<Entity[]>(`/orgs/${orgId}/entities`),
                ]);
                setAccounts(accountsRes.data);
                setEntities(entitiesRes.data);

                // Set default account if none selected
                if (!formData.accountId && accountsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, accountId: accountsRes.data[0].id }));
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        };

        if (orgId) {
            loadData();
        }
    }, [orgId]);

    const handleInputChange = (field: keyof CreateExpenseIncomeData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            setFormData(prev => ({ ...prev, tags: updatedTags }));
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
        setFormData(prev => ({ ...prev, tags: updatedTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>
                    {isExpense ? "Add Expense" : "Add Income"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: string) => handleInputChange("category", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Enter description"
                            required
                        />
                    </div>

                    {/* Account and Entity Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Account *</Label>
                            <Select
                                value={formData.accountId}
                                onValueChange={(value: string) => handleInputChange("accountId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name} ({account.type}) - Rs {account.balance.toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="entity">Entity (Optional)</Label>
                            <Select
                                value={formData.entityId || ""}
                                onValueChange={(value: string) => handleInputChange("entityId", value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select entity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* No 'No Entity' option; placeholder handles this case */}
                                    {entities.map((entity) => (
                                        <SelectItem key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                            />
                            <Button type="button" variant="outline" onClick={handleAddTag}>
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleRemoveTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>

                    {/* Recurring Options */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="recurring"
                                checked={formData.isRecurring}
                                onCheckedChange={(checked: boolean) => handleInputChange("isRecurring", checked)}
                            />
                            <Label htmlFor="recurring">Make this a recurring transaction</Label>
                        </div>

                        {formData.isRecurring && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="recurrenceType">Frequency</Label>
                                    <Select
                                        value={formData.recurrenceType}
                                        onValueChange={(value: string) => handleInputChange("recurrenceType", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RECURRENCE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interval">Every</Label>
                                    <Input
                                        id="interval"
                                        type="number"
                                        min="1"
                                        value={formData.recurrenceInterval}
                                        onChange={(e) => handleInputChange("recurrenceInterval", parseInt(e.target.value) || 1)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date (Optional)</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Saving..." : `Add ${isExpense ? "Expense" : "Income"}`}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
