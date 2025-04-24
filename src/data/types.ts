export interface User {
    id?: string;
    email: string;
    password: string;
    name: string;
    createdAt: string;
    updatedAt: string;

    organizations?: Organization[];
    permissions?: RoleAccess[];
}

export interface Organization {
    id?: string;
    name: string;
    ownerId: string;
    description: string | null;
    logo?: string | null;
    contact?: string | null;
    pan?: string | null;
    vat?: string | null;
    domain?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type ACCESS = "ORG" | "ACCOUNT" | "PRODUCT" | "ENTITY" | "ORDER";

export interface RoleAccess {
    id: string;
    userId: string;
    organizationId: string;
    access: ACCESS;
    user?: User;
    organization?: Organization;
}

export interface Invite {
    id: string;
    organizationId: string;
    email: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
    createdAt: string;
    updatedAt: string;

    organization?: Organization;
}

export type ACCOUNT_TYPE = "BANK" | "BANK_OD" | "CASH_COUNTER" | "CHEQUE" | "MISC";

export interface AccountDetails {
    accountNumber: string;
    bankName: string;
    chequeDate: string | null;
}

export interface Account {
    id: string;
    name: string;
    balance: number;
    type: ACCOUNT_TYPE;

    details: AccountDetails;

    organizationId: string;
    createdAt: string;
    updatedAt: string;

    transactions?: Transaction[];
}

export interface Entity {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    description: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    categoryId: string;
    image: string | null;
    price: number;
    stock: number;
    description: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "PARTIAL";

export interface Order {
    id: string;
    orderNumber: string;
    description?: string | null;

    type: "BUY" | "SELL" | "MISC";

    baseAmount: number;
    discount: number;
    tax: number;
    totalAmount: number;

    paymentStatus: PaymentStatus;

    organizationId: string;
    entityId?: string | null;
    createdAt: string;
    updatedAt: string;

    organization?: Organization | null;
    entity?: Entity | null;

    items?: OrderItem[];
    transactions?: Transaction[];
}

export interface OrderItem {
    id: string;
    name: string;
    description?: string | null;

    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    subTotal: number;

    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    description: string | null;
    amount: number;

    organizationId: string;
    accountId: string;
    orderId: string | null;
    type: "BUY" | "SELL" | "MISC" | "TRANSFER" | "REFUND" | "CHEQUE" | "CASH_COUNTER";

    createdAt: string;
    updatedAt: string;

    account?: Account | null;
    order?: Order | null;
    organization?: Organization | null;
}
