

export type AccessType = "VIEW_ORG" | "EDIT_ORG" | "DELETE_ORG" | "VIEW_USER" | "VIEW_PRODUCT" | "MANAGE_PRODUCT" | "VIEW_STOCK" | "MANAGE_STOCK";

export type OrganizationSchema = {
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

    permissions?: RoleAccessSchema[];
};

export type RoleAccessSchema = {
    id: string;

    userId: string;
    organizationId: string;
    access: AccessType;
    
    createdAt: string;
    updatedAt: string;
    user?: UserSchema;
};

export type InviteSchema = {
    id: string; 
    organizationId: string;
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};



export type UserSchema = {
    id: string;
    name: string;
    contact: string | null;
    email: string;
    type : string;
    status: string;

    createdAt: string;
    updatedAt: string;

    organizations?: OrganizationSchema[];
    permissions?: RoleAccessSchema[];
    invites?: InviteSchema[];
}