import { useAuth } from "@/providers/auth-provider";
import React from "react";
import {
    FiBarChart,
    FiPieChart,
    FiTrendingUp,
    FiShield,
    FiClock,
    FiUsers,
    FiUser,
    FiLogIn,
    FiMenu,
    FiX,
    FiArrowRight,
    FiCheck,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const FinAssistHomepage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <FiBarChart className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                fin-assist
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="#about"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                About
                            </a>
                            <div className="flex items-center space-x-4">
                                {user ? (
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <FiUser className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/auth/login"
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors justify-center"
                                    >
                                        <FiLogIn className="h-4 w-4" />
                                        <span>Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="text-gray-600 hover:text-blue-600"
                            >
                                {mobileMenuOpen ? (
                                    <FiX className="h-6 w-6" />
                                ) : (
                                    <FiMenu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-4 py-4 space-y-4">
                            <a
                                href="#features"
                                className="block text-gray-600 hover:text-blue-600"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="block text-gray-600 hover:text-blue-600"
                            >
                                Pricing
                            </a>
                            <a
                                href="#about"
                                className="block text-gray-600 hover:text-blue-600"
                            >
                                About
                            </a>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                {user ? (
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <FiUser className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/auth/login"
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors justify-center"
                                    >
                                        <FiLogIn className="h-4 w-4" />
                                        <span>Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                        Simplify Your
                        <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Financial Journey
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Transform your accounting workflow with intelligent
                        automation, real-time insights, and seamless
                        collaboration tools designed for modern businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2 text-lg font-medium">
                            <span>Start Free Trial</span>
                            <FiArrowRight className="h-5 w-5" />
                        </button>
                        <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all text-lg font-medium">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage your finances
                            efficiently and accurately
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiBarChart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Real-time Analytics
                            </h3>
                            <p className="text-gray-600">
                                Get instant insights into your financial
                                performance with interactive dashboards and
                                customizable reports.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiPieChart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Smart Categorization
                            </h3>
                            <p className="text-gray-600">
                                Automatically categorize transactions using
                                AI-powered recognition to save time and reduce
                                errors.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiTrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Forecasting
                            </h3>
                            <p className="text-gray-600">
                                Predict future cash flow and financial trends
                                with advanced forecasting algorithms.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiShield className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Bank-level Security
                            </h3>
                            <p className="text-gray-600">
                                Your data is protected with enterprise-grade
                                encryption and security protocols.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiClock className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Time Tracking
                            </h3>
                            <p className="text-gray-600">
                                Track billable hours and project costs with
                                integrated time management tools.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="bg-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <FiUsers className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Team Collaboration
                            </h3>
                            <p className="text-gray-600">
                                Work seamlessly with your team using role-based
                                access and real-time collaboration features.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section
                id="pricing"
                className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600">
                            Choose the plan that works best for your business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Starter
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Perfect for freelancers
                            </p>
                            <div className="text-4xl font-bold text-blue-600 mb-6">
                                $29
                                <span className="text-lg text-gray-500">
                                    /mo
                                </span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Up to 100 transactions</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Basic reporting</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Email support</span>
                                </li>
                            </ul>
                            <button className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                                Get Started
                            </button>
                        </div>

                        <div className="bg-blue-600 p-8 rounded-2xl shadow-xl transform scale-105">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Professional
                            </h3>
                            <p className="text-blue-100 mb-6">
                                Most popular choice
                            </p>
                            <div className="text-4xl font-bold text-white mb-6">
                                $79
                                <span className="text-lg text-blue-200">
                                    /mo
                                </span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-blue-200" />
                                    <span className="text-white">
                                        Unlimited transactions
                                    </span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-blue-200" />
                                    <span className="text-white">
                                        Advanced analytics
                                    </span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-blue-200" />
                                    <span className="text-white">
                                        Priority support
                                    </span>
                                </li>
                            </ul>
                            <button className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                                Start Free Trial
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Enterprise
                            </h3>
                            <p className="text-gray-600 mb-6">
                                For growing teams
                            </p>
                            <div className="text-4xl font-bold text-blue-600 mb-6">
                                $199
                                <span className="text-lg text-gray-500">
                                    /mo
                                </span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Everything in Pro</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Team collaboration</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <FiCheck className="h-5 w-5 text-green-600" />
                                    <span>Custom integrations</span>
                                </li>
                            </ul>
                            <button className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <FiBarChart className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">
                                fin-assist
                            </span>
                        </div>
                        <p className="text-gray-400">
                            © 2025 fin-assist. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FinAssistHomepage;
