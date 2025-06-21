import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/use-register";
import { validationRules } from "@/utils/validation";

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Register = () => {
    const {
        register: registerUser,
        isLoading,
        apiErrors,
        clearErrors,
    } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset,
        setError,
    } = useForm<RegisterFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Watch password for confirmation validation
    const password = watch("password");

    const onSubmit = useCallback(
        async (data: RegisterFormData) => {
            clearErrors();

            try {
                // Remove confirmPassword from submission data
                const { confirmPassword, ...submitData } = data;

                await registerUser(submitData);
                reset(); // Clear form on success
            } catch (error) {
                // Handle field-specific errors from API
                if (apiErrors && Object.keys(apiErrors).length > 0) {
                    Object.entries(apiErrors).forEach(([field, messages]) => {
                        if (field in data) {
                            setError(field as keyof RegisterFormData, {
                                type: "server",
                                message: messages[0],
                            });
                        }
                    });
                }
            }
        },
        [registerUser, reset, setError, clearErrors, apiErrors]
    );

    const isFormDisabled = isLoading || isSubmitting;
    return (
        <div>
            <h2 className="text-3xl font-semibold mb-2">Create an account</h2>
            <p className="text-gray-600 text-sm font-medium mb-6">
                Please fill in the details below to register for your
                personalized dashboard.
            </p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
            >
                {/* Full Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-600">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        disabled={isFormDisabled}
                        className={cn(
                            "w-full",
                            (errors.name || apiErrors.name) &&
                                "border-red-500 focus:ring-red-500"
                        )}
                        {...register("name", validationRules.name)}
                    />
                    {(errors.name || apiErrors.name) && (
                        <p className="text-red-500 text-xs font-medium">
                            {errors.name?.message || apiErrors.name?.[0]}
                        </p>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-600">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        disabled={isFormDisabled}
                        className={cn(
                            "w-full",
                            (errors.email || apiErrors.email) &&
                                "border-red-500 focus:ring-red-500"
                        )}
                        {...register("email", validationRules.email)}
                    />
                    {(errors.email || apiErrors.email) && (
                        <p className="text-red-500 text-xs font-medium">
                            {errors.email?.message || apiErrors.email?.[0]}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-600">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        disabled={isFormDisabled}
                        className={cn(
                            "w-full",
                            (errors.password || apiErrors.password) &&
                                "border-red-500 focus:ring-red-500"
                        )}
                        {...register("password", validationRules.password)}
                    />
                    {(errors.password || apiErrors.password) && (
                        <p className="text-red-500 text-xs font-medium">
                            {errors.password?.message ||
                                apiErrors.password?.[0]}
                        </p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="confirmPassword"
                        className="text-sm text-gray-600"
                    >
                        Confirm Password
                    </Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        disabled={isFormDisabled}
                        className={cn(
                            "w-full",
                            errors.confirmPassword &&
                                "border-red-500 focus:ring-red-500"
                        )}
                        {...register(
                            "confirmPassword",
                            validationRules.confirmPassword(password)
                        )}
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs font-medium">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isFormDisabled}
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2 h-11 font-medium"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating Account...
                        </div>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                {/* Login Link */}
                <p className="text-center font-medium text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/auth/login"
                        className="text-teal-700 hover:text-teal-800 hover:underline font-semibold"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
