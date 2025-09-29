// Common validation patterns and rules

export const validationPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    name: /^[a-zA-Z\s]+$/,
} as const;

export const validationMessages = {
    required: {
        name: "Full name is required",
        email: "Email address is required",
        password: "Password is required",
        confirmPassword: "Please confirm your password",
    },
    pattern: {
        email: "Please enter a valid email address",
        password: "Password must contain uppercase, lowercase, number and special character",
        name: "Name can only contain letters and spaces",
    },
    minLength: {
        name: "Name must be at least 2 characters long",
        password: "Password must be at least 8 characters long",
    },
    custom: {
        passwordMatch: "Passwords do not match",
    },
} as const;

export const validationRules = {
    name: {
        required: validationMessages.required.name,
        minLength: {
            value: 2,
            message: validationMessages.minLength.name,
        },
        pattern: {
            value: validationPatterns.name,
            message: validationMessages.pattern.name,
        },
    },
    email: {
        required: validationMessages.required.email,
        pattern: {
            value: validationPatterns.email,
            message: validationMessages.pattern.email,
        },
    },
    password: {
        required: validationMessages.required.password,
        minLength: {
            value: 8,
            message: validationMessages.minLength.password,
        },
        pattern: {
            value: validationPatterns.password,
            message: validationMessages.pattern.password,
        },
    },
    confirmPassword: (password: string) => ({
        required: validationMessages.required.confirmPassword,
        validate: (value: string) => value === password || validationMessages.custom.passwordMatch,
    }),
} as const;

// Balance validation functions
import type { Account } from "@/data/types";

export interface PaymentValidationResult {
    isValid: boolean;
    errors: string[];
    insufficientAccounts: Array<{
        accountId: string;
        accountName: string;
        required: number;
        available: number;
        shortfall: number;
    }>;
}

export function validateAccountBalances(
    payments: Array<{ amount: number; accountId: string }>,
    accounts: Account[],
    orderType: "BUY" | "SELL" | "MISC"
): PaymentValidationResult {
    const result: PaymentValidationResult = {
        isValid: true,
        errors: [],
        insufficientAccounts: [],
    };

    // Only validate for BUY orders
    if (orderType !== "BUY") {
        return result;
    }

    for (const payment of payments) {
        const account = accounts.find((acc) => acc.id === payment.accountId);
        if (!account) {
            result.isValid = false;
            result.errors.push(`Account not found for payment`);
            continue;
        }

        if (payment.amount > account.balance) {
            const shortfall = payment.amount - account.balance;
            result.isValid = false;
            result.errors.push(
                `Insufficient balance in ${account.name}. Available: Rs ${account.balance.toFixed(
                    2
                )}, Required: Rs ${payment.amount.toFixed(2)}`
            );
            result.insufficientAccounts.push({
                accountId: account.id,
                accountName: account.name,
                required: payment.amount,
                available: account.balance,
                shortfall,
            });
        }
    }

    return result;
}

export function getAccountTotalRequired(
    payments: Array<{ amount: number; accountId: string }>,
    accountId: string
): number {
    return payments
        .filter((payment) => payment.accountId === accountId)
        .reduce((total, payment) => total + payment.amount, 0);
}

export function canAccountAffordAmount(account: Account, amount: number): boolean {
    return account.balance >= amount;
}
