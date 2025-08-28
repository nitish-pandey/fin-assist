import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

interface ResetPasswordData {
    password: string;
    confirmPassword: string;
}

const ResetPassword = () => {
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordData>();

    useEffect(() => {
        if (!token || token.length < 10) {
            setIsTokenValid(false);
        }
    }, [token]);

    const onSubmit = async (data: ResetPasswordData) => {
        setIsSubmitting(true);
        try {
            await api.post("/users/reset-password", {
                newPassword: data.password,
                token: token,
            });

            setSuccess(true);
            toast({
                title: "Password reset successful",
                description:
                    "Your password has been reset successfully. You can now log in.",
            });
        } catch (error: any) {
            toast({
                title: "Reset failed",
                description:
                    error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderError = (message?: string) =>
        message && (
            <p
                className="text-red-500 text-xs font-medium mt-1"
                role="alert"
                aria-live="polite"
            >
                {message}
            </p>
        );

    return (
        <div className="max-w-md mx-auto w-full">
            {!isTokenValid ? (
                <div className="text-center">
                    <h2 className="text-3xl font-semibold mb-2 text-red-700">
                        Invalid or missing token
                    </h2>
                    <p className="text-gray-700 text-sm font-light">
                        The reset password link is invalid or has expired.
                        Please request a new one from the{" "}
                        <Link
                            to="/auth/forgot-password"
                            className="text-blue-700 underline font-medium"
                        >
                            forgot password page
                        </Link>
                        .
                    </p>
                </div>
            ) : success ? (
                <div className="text-center">
                    <h2 className="text-3xl font-semibold mb-2 text-green-700">
                        Password reset successful
                    </h2>
                    <p className="text-gray-700 text-sm font-light mb-4">
                        You can now log in with your new password. If you have
                        any issues, please contact support.
                    </p>
                    <Link
                        to="/auth/login"
                        className="inline-block px-4 py-2 bg-teal-800 text-white rounded-md hover:bg-teal-900"
                    >
                        Go to login
                    </Link>
                </div>
            ) : (
                <>
                    <h2 className="text-3xl font-semibold mb-2">
                        Reset your password
                    </h2>
                    <p className="text-gray-700 mb-6 text-sm font-light">
                        Enter your new password and confirm it below. Make sure
                        to choose a strong password that you haven't used
                        before.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                New password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message:
                                            "Password must be at least 6 characters",
                                    },
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                disabled={isSubmitting}
                            />
                            {renderError(errors.password?.message)}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === watch("password") ||
                                        "Passwords do not match",
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                disabled={isSubmitting}
                            />
                            {renderError(errors.confirmPassword?.message)}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-teal-800 text-white py-2 rounded-md transition-colors ${
                                isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-teal-900"
                            }`}
                        >
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>

                        <p className="text-center text-sm font-medium text-gray-600">
                            Know your password?{" "}
                            <Link
                                to="/auth/login"
                                className="text-blue-800 hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </form>
                </>
            )}
        </div>
    );
};

export default ResetPassword;
