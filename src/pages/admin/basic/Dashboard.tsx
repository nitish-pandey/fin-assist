import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
    Package,
    Settings,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { api } from "@/utils/api";
import { useOrg } from "@/providers/org-provider";

interface TransactionData {
    month: string;
    value: number;
}

interface DashboardData {
    transactions: TransactionData[];
    products: number;
    entities: number;
    creditPending: number;
    debitPending: number;
    buyPaid: number;
    sellPaid: number;
}

interface ApiResponse {
    success: boolean;
    data?: DashboardData;
    error?: string;
}

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { orgId } = useOrg();

    // Mock API call with 2-second delay
    const fetchDashboardData = async (): Promise<ApiResponse> => {
        try {
            const data = await api.get(`/orgs/${orgId}/dashboard`);
            console.log("Fetching dashboard data from API:", data.data);
            return {
                success: data.status === 200,
                data: data.data as DashboardData,
                error:
                    data.status !== 200
                        ? "Failed to fetch dashboard data"
                        : undefined,
            };
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return {
                success: false,
                error: "Failed to fetch dashboard data",
            };
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchDashboardData();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.error || "Unknown error occurred");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Derived data calculations
    const getDerivedData = (dashboardData: DashboardData) => {
        const totalTransactions = dashboardData.transactions.reduce(
            (sum, item) => sum + item.value,
            0
        );
        const totalTransactionsFormatted = `${(
            totalTransactions / 1000
        ).toFixed(2)}K`;

        const creditPendingFormatted = `${(
            dashboardData.creditPending / 1000
        ).toFixed(2)}K`;
        const debitPendingFormatted = `${(
            dashboardData.debitPending / 1000
        ).toFixed(2)}K`;

        const buyDue = 100 - dashboardData.buyPaid;
        const sellDue = 100 - dashboardData.sellPaid;

        // Format months for display (remove year)
        const chartData = dashboardData.transactions;

        return {
            totalTransactionsFormatted,
            creditPendingFormatted,
            debitPendingFormatted,
            buyDue,
            sellDue,
            chartData,
        };
    };

    // Progress circle component
    const ProgressCircle = ({ percentage = 20, size = 80 }) => {
        const radius = size / 2 - 8;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset =
            circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgb(243 244 246)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgb(168 85 247)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-in-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                        {percentage}%
                    </span>
                </div>
            </div>
        );
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="p-6 bg-gray-50 min-h-screen animate-pulse">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-64"></div>
                </div>

                {/* Top section skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart skeleton */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-6 bg-gray-300 rounded w-32"></div>
                            <div className="h-8 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>

                    {/* Cards skeleton */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-300 rounded-xl p-6 h-32"></div>
                            <div className="bg-white rounded-xl p-6 shadow-sm h-32"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-6 shadow-sm h-32"></div>
                            <div className="bg-white rounded-xl p-6 shadow-sm h-32"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom section skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm h-48"></div>
                    <div className="bg-white rounded-xl p-6 shadow-sm h-48"></div>
                </div>
            </div>
        </div>
    );

    // Error state component
    const ErrorState = () => (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        A descriptive body text comes here
                    </p>
                </div>

                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {loading ? "Retrying..." : "Retry"}
                    </button>
                </div>
            </div>
        </div>
    );

    // Show loading state
    if (loading && !data) {
        return <LoadingSkeleton />;
    }

    // Show error state
    if (error && !data) {
        return <ErrorState />;
    }

    // Show dashboard with data
    if (!data) return null;
    console.log(data.buyPaid);

    const derivedData = getDerivedData(data);

    return (
        <div className="p-6 bg-gray-50 ">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-600">
                            A descriptive body text comes here
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Transactions Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Transactions
                            </h2>
                            <span className="text-2xl font-bold text-gray-900">
                                {derivedData.totalTransactionsFormatted}
                            </span>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={derivedData.chartData}>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6B7280" }}
                                    />
                                    <YAxis hide />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="rgb(168 85 247)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{
                                            r: 6,
                                            fill: "rgb(168 85 247)",
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Side Cards */}
                    <div className="space-y-4">
                        {/* Products and Entities Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Products Card */}
                            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <Package className="w-8 h-8" />
                                </div>
                                <div className="text-3xl font-bold mb-1">
                                    {data.products}
                                </div>
                                <div className="text-cyan-100 text-sm">
                                    No. of Products
                                </div>
                            </div>

                            {/* Entities Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <Settings className="w-8 h-8 text-gray-600" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {data.entities}
                                </div>
                                <div className="text-gray-600 text-sm">
                                    No. of Entities
                                </div>
                            </div>
                        </div>

                        {/* Pending Amounts Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Credit Pending */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                    </div>
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {derivedData.creditPendingFormatted}
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Credit Pending
                                </div>
                            </div>

                            {/* Debit Pending */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {derivedData.debitPendingFormatted}
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Debit Pending
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Buy and Sell */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Buy Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            Buy
                        </h3>

                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                {/* <div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        Amount
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        Percentage
                                    </div>
                                </div> */}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                                        <span className="text-sm text-gray-900">
                                            Paid
                                        </span>
                                        <span className="text-sm text-gray-900 ml-auto">
                                            {data.buyPaid === undefined ||
                                            isNaN(data.buyPaid) ||
                                            data.buyPaid === null
                                                ? "NA"
                                                : data.buyPaid}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                                        <span className="text-sm text-gray-900">
                                            Due
                                        </span>
                                        <span className="text-sm text-gray-900 ml-auto">
                                            {data.buyPaid === undefined ||
                                            isNaN(data.buyPaid) ||
                                            data.buyPaid === null
                                                ? "NA"
                                                : derivedData.buyDue}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-8">
                                <ProgressCircle percentage={data.buyPaid} />
                            </div>
                        </div>
                    </div>

                    {/* Sell Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            Sell
                        </h3>

                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                {/* <div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        Amount
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        Percentage
                                    </div>
                                </div> */}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                                        <span className="text-sm text-gray-900">
                                            Paid
                                        </span>
                                        <span className="text-sm text-gray-900 ml-auto">
                                            {data.sellPaid === undefined ||
                                            isNaN(data.sellPaid) ||
                                            data.sellPaid === null
                                                ? "NA"
                                                : data.sellPaid}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                                        <span className="text-sm text-gray-900">
                                            Due
                                        </span>
                                        <span className="text-sm text-gray-900 ml-auto">
                                            {data.sellPaid === undefined ||
                                            isNaN(data.sellPaid) ||
                                            data.sellPaid === null
                                                ? "NA"
                                                : derivedData.sellDue}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-8">
                                <ProgressCircle percentage={data.sellPaid} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
