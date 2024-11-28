import { Link } from "react-router-dom";
import useToast from "../../providers/Toast";
import { useForm } from "react-hook-form";
import Cookies from "universal-cookie";
import { login } from "../../utils/api";

interface LoginData {
    email: string;
    password: string;
}

const Login = () => {
    const { showToast } = useToast();
    const cookies = new Cookies();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>();

    const onSubmit = async (data: LoginData) => {
        try {
            console.log(data);
            const res = await login(data);
            cookies.set("token", res.token, {
                path: "/",
                expires: new Date(Date.now() + 259200000),
            });
            showToast("Login successful", "success");
        } catch (error) {
            console.error(error);
            showToast("Invalid Credentails, try again", "error");
        }
    };
    return (
        <div>
            <h2 className="text-3xl font-semibold mb-2">Login credentials</h2>
            <p className="text-gray-700 mb-6 text-sm font-light">
                Please log in with your Email ID and password to continue to
                your personalized dashboard.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm text-gray-600 mb-1"
                    >
                        Work email
                    </label>
                    <input
                        id="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: "Please enter a valid email",
                            },
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs font-medium mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="password"
                            className="block text-sm text-gray-600"
                        >
                            Password
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
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
                    disabled={isSubmitting}
                    className="w-full bg-teal-800 text-white py-2 rounded-md hover:bg-teal-900 transition-colors"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <p className="text-center text-sm font-medium text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/auth/register"
                        className="text-blue-800 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
