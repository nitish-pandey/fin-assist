import { Organization } from "@/data/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/utils/api";
interface OrgContextData {
    orgId: string;
    organization: Organization | null;
    refetch: () => void;
}

const OrgContext = createContext<OrgContextData>({} as OrgContextData);

interface OrgProviderProps {
    children: React.ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const [organization, setOrganization] = useState<Organization | null>(null);

    const fetchOrganization = async (orgId: string) => {
        try {
            const data = await (await api.get(`/orgs/${orgId}`)).data;
            setOrganization(data);
        } catch (error) {
            console.error("Error fetching organization:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (orgId) {
                await fetchOrganization(orgId);
            }
        };
        fetchData();
    }, [orgId]);

    const refetch = async () => {
        if (orgId) {
            await fetchOrganization(orgId);
        }
    };

    return (
        <OrgContext.Provider value={{ orgId, organization, refetch }}>
            {children}
        </OrgContext.Provider>
    );
};

// useOrg hook
export const useOrg = () => {
    const context = useContext(OrgContext);
    if (!context) {
        throw new Error("useOrg must be used within an OrgProvider");
    }
    return context;
};
