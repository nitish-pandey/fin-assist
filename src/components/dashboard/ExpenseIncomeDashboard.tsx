import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    BarChart3,
} from "lucide-react";
import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { ExpenseIncomeSummary, TransactionCategory } from "@/data/expense-income-types";

interface ExpenseIncomeDashboardProps {
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

export default function ExpenseIncomeDashboard({ dateRange }: ExpenseIncomeDashboardProps) {
    const { orgId } = useOrg();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<ExpenseIncomeSummary | null>(null);

    useEffect(() => {
        if (orgId) {
            loadSummary();
        }
    }, [orgId, dateRange]);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const endDate = dateRange?.endDate || new Date().toISOString();
            const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const response = await api.get(`/orgs/${orgId}/expenses-income/summary`, {
                params: {
                    startDate,
                    endDate,
                },
            });
            setSummary(response.data);
        } catch (error) {
            console.error("Failed to load expense/income summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatCategory = (category: TransactionCategory) => {
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!summary) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No expense/income data available</p>
                </CardContent>
            </Card>
        );
    }

    // Prepare data for display
    const expenseCategories = summary.byCategory.filter(cat => cat.isExpense);
    const incomeCategories = summary.byCategory.filter(cat => !cat.isExpense);

    const topExpenseCategories = summary.topCategories.filter(cat => cat.isExpense).slice(0, 5);
    const topIncomeCategories = summary.topCategories.filter(cat => !cat.isExpense).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.totalIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {incomeCategories.length} categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.totalExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {expenseCategories.length} categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(summary.netAmount))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary.netAmount >= 0 ? 'Profit' : 'Loss'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
                        <PieChart className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalIncome > 0 ? 
                                Math.round((summary.totalExpenses / summary.totalIncome) * 100) : 0}%
                        </div>
                        <Progress 
                            value={summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 : 0} 
                            className="mt-2"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row - Simple Cards for now */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Monthly Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.byMonth.slice(0, 6).map((month) => (
                                <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Net: <span className={month.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(Math.abs(month.netAmount))}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-green-600">+{formatCurrency(month.totalIncome)}</p>
                                        <p className="text-red-600">-{formatCurrency(month.totalExpenses)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Category Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Category Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-red-600 mb-2">Expenses by Category</h4>
                                {summary.byCategory.filter(cat => cat.isExpense).slice(0, 5).map((category) => (
                                    <div key={category.category} className="flex items-center justify-between py-2">
                                        <span className="text-sm">{formatCategory(category.category)}</span>
                                        <span className="text-sm font-medium text-red-600">
                                            {formatCurrency(category.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-green-600 mb-2">Income by Category</h4>
                                {summary.byCategory.filter(cat => !cat.isExpense).slice(0, 5).map((category) => (
                                    <div key={category.category} className="flex items-center justify-between py-2">
                                        <span className="text-sm">{formatCategory(category.category)}</span>
                                        <span className="text-sm font-medium text-green-600">
                                            {formatCurrency(category.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Expense Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Top Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topExpenseCategories.map((category, index) => (
                                <div key={category.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{formatCategory(category.category)}</p>
                                            <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of expenses</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{formatCurrency(category.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Income Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Top Income Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topIncomeCategories.map((category, index) => (
                                <div key={category.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{formatCategory(category.category)}</p>
                                            <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of income</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{formatCurrency(category.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
