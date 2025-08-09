import { Account, Entity, Organization } from "./types";

// Expense and Income related types
export interface ExpenseIncomeTransaction {
    id: string;
    amount: number;
    description: string;
    category: TransactionCategory;
    isExpense: boolean;
    organizationId: string;
    accountId: string;
    entityId?: string;
    tags: string[];
    notes?: string;
    attachments?: any;
    isRecurring: boolean;
    recurrenceType: RecurrenceType;
    recurrenceInterval?: number;
    nextDueDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    parentTransactionId?: string;
    
    // Relations
    account?: Account;
    entity?: Entity;
    organization?: Organization;
    parentTransaction?: ExpenseIncomeTransaction;
    childTransactions?: ExpenseIncomeTransaction[];
}

export type TransactionCategory = 
    // Expense Categories
    | "OFFICE_RENT"
    | "EMPLOYEE_SALARY"
    | "UTILITY_BILLS"
    | "OFFICE_SUPPLIES"
    | "TRAVEL_EXPENSE"
    | "MARKETING_ADVERTISING"
    | "PROFESSIONAL_FEES"
    | "EQUIPMENT_MAINTENANCE"
    | "INSURANCE"
    | "TAXES"
    | "DONATIONS_GIVEN"
    | "INTEREST_PAID"
    | "DEPRECIATION"
    | "MISCELLANEOUS_EXPENSE"
    // Income Categories
    | "SERVICE_INCOME"
    | "CONSULTING_INCOME"
    | "RENTAL_INCOME"
    | "INTEREST_RECEIVED"
    | "DONATIONS_RECEIVED"
    | "COMMISSION_INCOME"
    | "DIVIDEND_INCOME"
    | "CAPITAL_GAINS"
    | "MISCELLANEOUS_INCOME"
    // Existing for backward compatibility
    | "PRODUCT_SALE"
    | "PRODUCT_PURCHASE";

export type RecurrenceType = 
    | "NONE"
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY";

export interface ExpenseIncomeSummary {
    totalExpenses: number;
    totalIncome: number;
    netAmount: number;
    byCategory: {
        category: TransactionCategory;
        amount: number;
        count: number;
        isExpense: boolean;
    }[];
    byMonth: {
        month: string;
        totalExpenses: number;
        totalIncome: number;
        netAmount: number;
    }[];
    topCategories: {
        category: TransactionCategory;
        amount: number;
        percentage: number;
        isExpense: boolean;
    }[];
}

export interface ExpenseIncomeFilters {
    isExpense?: boolean;
    category?: TransactionCategory;
    accountId?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    isRecurring?: boolean;
}

export interface CreateExpenseIncomeData {
    amount: number;
    description: string;
    category: TransactionCategory;
    isExpense: boolean;
    accountId: string;
    entityId?: string;
    tags?: string[];
    notes?: string;
    attachments?: any;
    isRecurring?: boolean;
    recurrenceType?: RecurrenceType;
    recurrenceInterval?: number;
    endDate?: string;
}

export interface UpdateExpenseIncomeData {
    amount?: number;
    description?: string;
    category?: TransactionCategory;
    accountId?: string;
    entityId?: string;
    tags?: string[];
    notes?: string;
    attachments?: any;
}
