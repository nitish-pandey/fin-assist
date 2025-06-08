import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/utils/api";

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState("");

    const token = searchParams.get("token");

    // Mock API call
    const verifyToken = async (token: string) => {
        // Mock logic - in real app, this would be an actual API call
        if (!token) {
            throw new Error("No verification token provided");
        }

        if (token.length < 10) {
            throw new Error("Invalid verification token");
        }

        api.post("/users/verify-account", { token })
            .then((response) => {
                if (response.data.success) {
                    setStatus("success");
                } else {
                    throw new Error(
                        response.data.message || "Verification failed"
                    );
                }
            })
            .catch((error) => {
                console.error("Verification API error:", error);
                setStatus("error");
                setErrorMessage(
                    error.response.data.error || "An unexpected error occurred"
                );
            });
    };

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("No verification token found in URL");
                return;
            }

            try {
                setStatus("loading");
                await verifyToken(token);
                setStatus("success");
            } catch (error) {
                setStatus("error");
                const errMsg =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred";
                setErrorMessage(errMsg);
            }
        };

        handleVerification();
    }, [token]);

    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verifying Your Email
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we verify your email address...
                        </p>
                    </div>
                );

            case "success":
                return (
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your email address has been verified. You can now
                            log in to your account.
                        </p>
                        <div className="space-y-4">
                            <Link
                                to="/auth/login"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Mail className="h-5 w-5 mr-2" />
                                Continue to Login
                            </Link>
                        </div>
                    </div>
                );

            case "error":
                return (
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <XCircle className="h-16 w-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verification Failed
                        </h1>
                        <p className="text-red-600 mb-8">{errorMessage}</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Try Again
                            </button>
                            <div>
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
                return null;
        }
    };

    return <div className="w-[400px]">{renderContent()}</div>;
};

export default VerificationPage;
