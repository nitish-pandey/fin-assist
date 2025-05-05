import { Organization, User, RoleAccess } from "@/data/types";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/utils/api";

interface AuthContextData {
    user: User | null;
    orgs: Organization[] | null;
    permissions: RoleAccess[] | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [orgs, setOrgs] = useState<Organization[] | null>(null);
    const [permissions, setPermissions] = useState<RoleAccess[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const initializeAuth = async () => {
        setLoading(true);
        try {
            const res = (await api.get("/users/me", { withCredentials: true })).data as User;

            setUser(res);
            setOrgs(res.organizations || []);
            setPermissions(res.permissions || []);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = (
                await api.post("/users/login", { email, password }, { withCredentials: true })
            ).data as {
                user: User;
                organizations: Organization[];
                permissions: RoleAccess[];
            };

            setUser(res.user);
            setOrgs(res.organizations);
            setPermissions(res.permissions);
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Invalid credentials or server error.");
        }
    };

    const logout = useCallback(async () => {
        try {
            await api.post("/users/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
        setUser(null);
        setOrgs(null);
        setPermissions(null);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, orgs, permissions, login, logout, loading, refetch: initializeAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
