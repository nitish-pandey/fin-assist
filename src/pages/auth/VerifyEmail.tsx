import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
    Mail,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { api } from "@/utils/api";

// Types for better type safety
type VerificationStatus = "idle" | "loading" | "success" | "error";

interface VerificationState {
    status: VerificationStatus;
    errorMessage: string;
    retryCount: number;
}

interface ApiError {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
        status?: number;
    };
    message?: string;
}

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const verificationInProgress = useRef(false);

    // Consolidated state management
    const [state, setState] = useState<VerificationState>({
        status: "idle",
        errorMessage: "",
        retryCount: 0,
    });

    const token = useMemo(() => searchParams.get("token"), [searchParams]); // Optimized API call with proper error handling
    const verifyToken = useCallback(
        async (verificationToken: string): Promise<void> => {
            // Prevent concurrent verification attempts
            if (verificationInProgress.current) {
                console.log("Verification already in progress, skipping...");
                return;
            }

            try {
                verificationInProgress.current = true;
                console.log(
                    "Starting verification for token:",
                    verificationToken.substring(0, 10) + "..."
                );
                setState((prev) => ({ ...prev, status: "loading" }));

                const response = await api.post("/users/verify-account", {
                    token: verificationToken,
                });

                console.log("API Response:", response.data);

                // Handle successful response - be more lenient with success detection
                if (
                    response.data &&
                    (response.data.success === true || response.status === 200)
                ) {
                    console.log("Verification successful");
                    setState((prev) => ({
                        ...prev,
                        status: "success",
                        errorMessage: "",
                    }));
                    return;
                }

                // Handle API response that indicates failure
                if (response.data && response.data.success === false) {
                    throw new Error(
                        response.data.message ||
                            response.data.error ||
                            "Verification failed"
                    );
                }

                // If we get here, assume success if there's no explicit error
                if (response.status >= 200 && response.status < 300) {
                    console.log(
                        "Verification assumed successful based on status code"
                    );
                    setState((prev) => ({
                        ...prev,
                        status: "success",
                        errorMessage: "",
                    }));
                    return;
                }

                // Handle unexpected response format
                throw new Error("Unexpected response format from server");
            } catch (error) {
                console.error("Verification API error:", error);

                let errorMessage = "An unexpected error occurred";

                // Handle axios/network errors
                if (error && typeof error === "object" && "response" in error) {
                    const apiError = error as ApiError;
                    if (apiError.response?.data?.error) {
                        errorMessage = apiError.response.data.error;
                    } else if (apiError.response?.data?.message) {
                        errorMessage = apiError.response.data.message;
                    } else if (apiError.response?.status) {
                        errorMessage = `Server error: ${apiError.response.status}`;
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                setState((prev) => ({
                    ...prev,
                    status: "error",
                    errorMessage,
                }));
            } finally {
                verificationInProgress.current = false;
            }
        },
        []
    ); // Validation function
    const validateToken = useCallback((token: string | null): string | null => {
        if (!token) {
            return "No verification token found in URL";
        }

        if (token.trim().length === 0) {
            return "Verification token is empty";
        }

        if (token.length < 8) {
            return "Verification token is too short";
        }

        // More flexible token validation - allow more characters commonly used in tokens
        if (!/^[a-zA-Z0-9._-]+$/.test(token)) {
            return "Verification token contains invalid characters";
        }

        return null;
    }, []); // Retry function
    const handleRetry = useCallback(() => {
        if (token && state.retryCount < 3) {
            setState((prev) => ({
                ...prev,
                status: "loading",
                errorMessage: "",
                retryCount: prev.retryCount + 1,
            }));
            // Use setTimeout to avoid immediate re-execution
            setTimeout(() => {
                verifyToken(token);
            }, 100);
        }
    }, [token, state.retryCount, verifyToken]);

    // Track if currently retrying
    const isRetrying = state.status === "loading" && state.retryCount > 0; // Main verification effect
    useEffect(() => {
        const handleVerification = async () => {
            // Only run if we haven't processed this token yet and we have a token
            if (state.status !== "idle" || !token) {
                return;
            }

            console.log(
                "Starting verification process for token:",
                token?.substring(0, 10) + "..."
            );

            // Validate token first
            const validationError = validateToken(token);
            if (validationError) {
                console.log("Token validation failed:", validationError);
                setState((prev) => ({
                    ...prev,
                    status: "error",
                    errorMessage: validationError,
                }));
                return;
            }

            // Verify the token (this will handle setting loading state internally)
            await verifyToken(token);
        };

        handleVerification();
    }, [token, validateToken, verifyToken]); // Removed state.status from dependencies to prevent re-runs// Auto-redirect after successful verification
    useEffect(() => {
        if (state.status === "success") {
            const timer = setTimeout(() => {
                navigate("/profile");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [state.status, navigate]);

    // Optimized render content with memoization
    const renderContent = useMemo(() => {
        switch (state.status) {
            case "idle":
            case "loading":
                return (
                    <div className="text-center animate-fadeIn w-full">
                        <div className="flex justify-center mb-6">
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verifying Your Email
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we verify your email address...
                        </p>
                        {state.retryCount > 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                Retry attempt {state.retryCount}/3
                            </p>
                        )}
                    </div>
                );

            case "success":
                return (
                    <div className="text-center animate-fadeIn">
                        <div className="flex justify-center mb-6">
                            <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Your email address has been verified. You can now
                            access your account.
                        </p>{" "}
                        <p className="text-sm text-gray-500 mb-8">
                            You will be redirected to your profile in 3
                            seconds...
                        </p>
                        <div className="space-y-4">
                            <Link
                                to="/profile"
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <Mail className="h-5 w-5 mr-2" />
                                Go to Profile
                            </Link>
                        </div>
                    </div>
                );

            case "error":
                return (
                    <div className="text-center animate-fadeIn">
                        <div className="flex justify-center mb-6">
                            <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verification Failed
                        </h1>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm font-medium">
                                {state.errorMessage}
                            </p>
                        </div>
                        <div className="space-y-4">
                            {" "}
                            {state.retryCount < 3 && token && (
                                <button
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <RefreshCw className="h-5 w-5 mr-2" />
                                    Try Again ({3 - state.retryCount} attempts
                                    left)
                                </button>
                            )}
                            {state.retryCount >= 3 && (
                                <div className="text-sm text-gray-600 mb-4">
                                    Maximum retry attempts reached. Please
                                    contact support if the issue persists.
                                </div>
                            )}{" "}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <Link
                                    to="/profile"
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Go to Profile
                                </Link>
                                <Link
                                    to="/"
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <p className="text-gray-600">
                            Something went wrong. Please refresh the page.
                        </p>
                    </div>
                );
        }
    }, [
        state.status,
        state.errorMessage,
        state.retryCount,
        token,
        handleRetry,
        isRetrying,
    ]);

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
            {renderContent}{" "}
        </div>
    );
};

export default VerificationPage;
