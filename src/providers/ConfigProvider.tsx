// contexts/GlobalContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import Cookies from "universal-cookie";
import { getUserInfo } from "../utils/api";

import { UserType, OrganizationType, PermissionType } from "../data/types";

interface GlobalContextType {
    profile: UserType | null;
    organization: OrganizationType[] | null;
    permissions: PermissionType[] | null;
    setProfile: (profile: UserType | null) => void;
    setOrganization: (organization: OrganizationType[] | null) => void;
    updateProfile: () => Promise<void>;
}

// Create context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [profile, setProfile] = useState<UserType | null>(null);
    const [organization, setOrganization] = useState<OrganizationType[] | null>(
        null
    );
    const [permissions, setPermissions] = useState<PermissionType[] | null>(
        null
    );

    const cookies = new Cookies();

    const updateProfile = useCallback(async () => {
        const token = cookies.get("token");
        const userId = cookies.get("userId");
        if (!token || !userId) {
            return;
        }
        // remove alphabets from userId, only digits

        try {
            const res = await getUserInfo({
                token,
                userId,
            });
            setProfile(res);
            setOrganization(res.organizations || []);
            setPermissions(res.permissions || []);
        } catch (error: any) {
            console.error("Error updating profile:", error);
        }
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                profile,
                organization,
                updateProfile,
                setProfile,
                setOrganization,
                permissions,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

// Hook to use GlobalContext
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within a GlobalProvider"
        );
    }
    return context;
};
