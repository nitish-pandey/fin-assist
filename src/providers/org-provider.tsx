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
    const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
    const [organization, setOrganization] = useState<Organization | null>(null);

    const fetchOrganization = async (orgId: string) => {
        try {
            setStatus("loading");
            const data = await (await api.get(`/orgs/${orgId}`)).data;
            setOrganization(data);
        } catch (error) {
            console.error("Error fetching organization:", error);
        } finally {
            setStatus("success");
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
            {status === "loading" ? (
                <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
                    <div className="flex items-center justify-center h-16 w-16 border-4 border-gray-200 rounded-full animate-spin"></div>
                </div>
            ) : status === "error" ? (
                <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
                    <p className="text-red-500">Error fetching organization data</p>
                </div>
            ) : null}
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
