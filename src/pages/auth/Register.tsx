import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
interface RegisterData {
    name: string;
    email: string;
    password: string;
}

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterData>();

    const { toast } = useToast();
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterData) => {
        try {
            await api.post("/users/register", data);
            toast({
                title: "Registration successful",
                description: "You are now registered.",
            });
            setTimeout(() => {
                navigate("/auth/login");
            }, 3500);
        } catch (error) {
            console.error(error);
            toast({
                title: "Registration failed",
                description: "Registration failed. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold mb-2">Create an account</h2>
            <p className="text-gray-600 text-sm font-medium mb-6">
                Please fill in the details below to register for your
                personalized dashboard.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm text-gray-600 mb-1"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        {...register("name", {
                            required: "Name is required",
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs font-medium mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm text-gray-600 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: "Please enter a valid email",
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs font-medium mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm text-gray-600 mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message:
                                    "Password should be atleast 6 characters",
                            },
                        })}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs font-medium mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-teal-800 text-white py-2 rounded-md hover:bg-teal-900 transition-colors"
                >
                    Register
                </button>

                <p className="text-center font-medium text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/auth/login"
                        className="text-blue-800 hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
