import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

interface UseRegisterReturn {
    register: (data: RegisterData) => Promise<void>;
    isLoading: boolean;
    apiErrors: Record<string, string[]>;
    clearErrors: () => void;
}

export const useRegister = (): UseRegisterReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

    const { toast } = useToast();
    const navigate = useNavigate();

    const register = useCallback(
        async (data: RegisterData) => {
            setIsLoading(true);
            setApiErrors({});

            try {
                await api.post("/users/register", data);

                toast({
                    title: "Registration successful",
                    description:
                        "You are now registered. Please check your email for verification.",
                });

                // Navigate after a short delay to show the toast
                setTimeout(() => {
                    navigate("/unverified");
                }, 2000);
            } catch (error) {
                console.error("Registration error:", error);

                if (error instanceof AxiosError && error.response?.data) {
                    const errorData = error.response.data as ApiError;

                    // Handle field-specific errors
                    if (errorData.errors) {
                        setApiErrors(errorData.errors);
                    }

                    toast({
                        title: "Registration failed",
                        description:
                            errorData.message ||
                            "Please check your information and try again.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Registration failed",
                        description:
                            "Network error. Please check your connection and try again.",
                        variant: "destructive",
                    });
                }

                throw error; // Re-throw to allow form handling
            } finally {
                setIsLoading(false);
            }
        },
        [toast, navigate]
    );

    const clearErrors = useCallback(() => {
        setApiErrors({});
    }, []);

    return {
        register,
        isLoading,
        apiErrors,
        clearErrors,
    };
};
