import React from "react";
import { Link } from "react-router-dom"; // Or use `next/link` if you're using Next.js
import { FaUser, FaSignInAlt } from "react-icons/fa";

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-gray-600 max-w-md mb-6">
                Sorry, the page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/auth/login"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all"
                >
                    <FaSignInAlt />
                    Go to Login
                </Link>
                <Link
                    to="/profile"
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg transition-all"
                >
                    <FaUser />
                    Go to Profile
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
