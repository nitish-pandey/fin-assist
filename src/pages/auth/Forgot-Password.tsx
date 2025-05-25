import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ForgotPasswordData {
    email: string;
}

const ForgotPassword = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>();

    const renderError = (message?: string) =>
        message && (
            <p className="text-red-500 text-xs font-medium mt-1" role="alert" aria-live="polite">
                {message}
            </p>
        );

    const onSubmit = async (data: ForgotPasswordData) => {
        setIsSubmitting(true);

        try {
            await new Promise((res) => setTimeout(res, 2000)); // mock API call

            if (data.email === "unknown@example.com") {
                throw new Error("No user found with this email.");
            }

            setSubmittedEmail(data.email);
            setSuccess(true);
        } catch (error: any) {
            toast({
                title: "Request failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {!success ? (
                <>
                    <h2 className="text-3xl font-semibold mb-2">Forgot your password?</h2>
                    <p className="text-gray-700 mb-6 text-sm font-light">
                        Enter your work email and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                                Work email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                        message: "Please enter a valid email",
                                    },
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                disabled={isSubmitting}
                            />
                            {renderError(errors.email?.message)}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-teal-800 text-white py-2 rounded-md transition-colors ${
                                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-900"
                            }`}
                        >
                            {isSubmitting ? "Sending reset link..." : "Send reset link"}
                        </button>
                    </form>
                </>
            ) : (
                <div className="text-center">
                    <h2 className="text-3xl font-semibold mb-2">Check your email</h2>
                    <p className="text-gray-700 mb-6 text-sm font-light">
                        A password reset link has been sent to{" "}
                        <span className="font-medium">{submittedEmail}</span>. Please check your
                        inbox and follow the instructions to reset your password.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
