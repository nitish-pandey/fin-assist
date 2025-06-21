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
        password:
            "Password must contain uppercase, lowercase, number and special character",
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
        validate: (value: string) =>
            value === password || validationMessages.custom.passwordMatch,
    }),
} as const;
