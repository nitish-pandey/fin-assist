// contexts/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import Cookies from "universal-cookie";
import { getUserInfo, login as APILogin } from "../utils/api"; // Make sure this handles errors and includes token validation
import {
    UserSchema,
    OrganizationSchema,
    RoleAccessSchema,
} from "../data/types";

interface AuthContextProps {
    login: (email: string, password: string) => Promise<void>;
    isUpdating: boolean;
    logout: () => void;
    authenticated: boolean;
    profile: UserSchema | null;
    organizations: OrganizationSchema[] | null;
    permissions: RoleAccessSchema[] | null;
    updateProfile: () => Promise<void>;
    error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [profile, setProfile] = useState<UserSchema | null>(null);
    const [organizations, setOrganizations] = useState<
        OrganizationSchema[] | null
    >(null);
    const [permissions, setPermissions] = useState<RoleAccessSchema[] | null>(
        null
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cookies = new Cookies();

    const updateProfile = useCallback(async () => {
        setIsUpdating(true);
        const token = cookies.get("token");
        const userId = cookies.get("userId");
        if (!token || !userId) {
            setAuthenticated(false);
            setProfile(null);
            return;
        }
        try {
            const res = await getUserInfo(token, userId);
            setProfile(res.profile);
            setOrganizations(res.organizations);
            setPermissions(res.permissions);
            setAuthenticated(true);
            setError(null); // Clear previous errors
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to fetch user information.");
            setAuthenticated(false);
            setProfile(null);
            throw Error("Failed to fetch user information.");
        } finally {
            setIsUpdating(false);
        }
    }, [cookies]);

    const login = useCallback(
        async (email: string, password: string) => {
            setIsUpdating(true);
            try {
                const response = await APILogin(email, password);
                const token = response.token;
                const user = response.user;
                cookies.set("token", token, {
                    path: "/",
                    secure: true,
                    httpOnly: false,
                });
                cookies.set("userId", user.id, {
                    path: "/",
                    secure: true,
                    httpOnly: false,
                });
                setProfile(user);
                setAuthenticated(true);
                setError(null);
            } catch (err: any) {
                console.error("Error logging in:", err);
                setError(err.response?.data?.message || "Login failed.");
                setAuthenticated(false);
                setProfile(null);
                throw Error("Login failed.");
            } finally {
                setIsUpdating(false);
            }
        },
        [cookies]
    );

    const logout = useCallback(() => {
        cookies.remove("token", { path: "/" });
        cookies.remove("userId", { path: "/" });
        setProfile(null);
        setAuthenticated(false);
    }, [cookies]);

    useEffect(() => {
        updateProfile().then(() => ({}));
    }, []);

    const contextValue = useMemo(
        () => ({
            login,
            logout,
            authenticated,
            isUpdating,
            organizations,
            permissions,
            profile,
            updateProfile,
            error,
        }),
        [login, logout, authenticated, profile, updateProfile, error]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use AuthContext
export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
