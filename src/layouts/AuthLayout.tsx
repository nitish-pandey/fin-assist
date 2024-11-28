import { Link, Outlet } from "react-router-dom";
import AuthImg from "../assets/bg/auth-img.svg";

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-sky-400 to-white relative">
            <div className="max-w-7xl mx-auto px-4 pt-3 pb-24 flex gap-20 items-center justify-between">
                {/* Left Section */}
                <div className="mx-auto max-w-xl hidden md:block">
                    <Link to="/" className="block mb-6">
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="block text-gray-600">Hello,</span>
                            <span className="block text-teal-800">
                                welcome!
                            </span>
                        </h1>
                    </Link>
                    <div className="mb-6">
                        <img
                            src={AuthImg}
                            alt="People interacting with screen"
                            className="max-w-md mx-auto"
                        />
                    </div>
                    <p className="text-gray-900 max-w-md font-medium">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Vivamus malesuada lorem purus. Cras suscipit metus a
                        gravida consequat.
                    </p>
                </div>

                {/* Right Section - Login Form Outlet */}
                <div className="flex-1 max-w-md">
                    <div className="bg-white rounded-lg p-8">
                        <Outlet />
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden h-24">
                <svg
                    className="relative block w-full h-[100px]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                        className="fill-white"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default AuthLayout;
