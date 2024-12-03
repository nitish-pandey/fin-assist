export enum Permissions {
    VIEW_ORG = "VIEW_ORG",
    EDIT_ORG = "EDIT_ORG",
    DELETE_ORG = "DELETE_ORG",
    VIEW_USER = "VIEW_USER",
    VIEW_PRODUCT = "VIEW_PRODUCT",
    MANAGE_PRODUCT = "MANAGE_PRODUCT",
    VIEW_STOCK = "VIEW_STOCK",
    MANAGE_STOCK = "MANAGE_STOCK",
};

export type OrganizationType = {
    id: string;
    name: string;
    description: string | null;
    contact: string | null;
    domain: string | null;
    ownerId: string;
    panNumber: string | null;
    vatNumber: string | null;
    logo: string | null;
    type: string;

    createdAt: string;
    updatedAt: string;
};

export type PermissionType = {
    id: string;

    userId: string;
    organizationId: string;
    access: string;
    
    createdAt: string;
    updatedAt: string;
};


export type UserType = {
    id: string;
    name: string;
    contact: string | null;
    email: string;
    type : string;
    status: string;

    createdAt: string;
    updatedAt: string;

    organizations?: OrganizationType[];
    permissions?: PermissionType[];
}