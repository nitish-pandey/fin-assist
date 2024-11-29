
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

export type UserType = {
    id: number;
    name: string;
    contact: string | null;
    email: string;
    type : string;
    status: string;

    createdAt: string;
    updatedAt: string;

    organizations?: OrganizationType[];
}