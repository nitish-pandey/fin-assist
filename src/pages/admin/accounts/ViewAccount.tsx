import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Account } from "@/data/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountCard from "@/components/cards/AccountCard";

const ViewAccountPage = () => {
    const { orgId } = useOrg();
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await api.get(`orgs/${orgId}/accounts`);
            setAccounts(data);
        };
        fetchAccounts();
    }, [orgId]);

    return (
        <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">Accounts</h2>
                    <p className="text-sm text-gray-400">View and manage accounts</p>
                </div>
                <Link
                    to={`/org/${orgId}/accounts/create`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                    Create Account
                </Link>
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mt-8">Bank Accounts</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                    {accounts
                        .filter((account) => account.type === "BANK")
                        .map((account) => (
                            <AccountCard
                                key={account.id}
                                accountName={account.name}
                                accountNumber={account.details.accountNumber}
                                bankName={account.details.bankName}
                                balance={account.balance}
                            />
                        ))}
                </div>
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mt-8">Bank OD</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                    {accounts
                        .filter((account) => account.type === "BANK_OD")
                        .map((account) => (
                            <AccountCard
                                key={account.id}
                                accountName={account.name}
                                accountNumber={account.details.accountNumber}
                                bankName={account.details.bankName}
                                balance={account.balance}
                            />
                        ))}
                    {/* if no  */}
                    {accounts.filter((account) => account.type === "BANK_OD").length === 0 && (
                        <p className="text-gray-400">No Bank OD accounts found</p>
                    )}
                </div>
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mt-8">Cash</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                    {accounts
                        .filter((account) => account.type === "CASH_COUNTER")
                        .map((account) => (
                            <div className="bg-white shadow rounded p-4 w-72" key={account.id}>
                                <p className="text-lg font-semibold text-gray-800">
                                    {account.name}
                                </p>
                                <p className="text-sm text-gray-400">Balance: {account.balance}</p>
                            </div>
                        ))}
                    {/* if no  */}
                    {accounts.filter((account) => account.type === "CASH_COUNTER").length === 0 && (
                        <p className="text-gray-400">No Cash accounts found</p>
                    )}
                </div>
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mt-8">Cheque</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                    {accounts
                        .filter((account) => account.type === "CHEQUE")
                        .map((account) => (
                            <div className="bg-white shadow rounded p-4 w-72" key={account.id}>
                                <p className="text-lg font-semibold text-gray-800">
                                    {account.name}
                                </p>
                                <p className="text-sm text-gray-400">Balance: {account.balance}</p>
                            </div>
                        ))}
                    {/* if no  */}
                    {accounts.filter((account) => account.type === "CHEQUE").length === 0 && (
                        <p className="text-gray-400">No Cheque accounts found</p>
                    )}
                </div>
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mt-8">Miscellaneous</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                    {accounts
                        .filter((account) => account.type === "MISC")
                        .map((account) => (
                            <div className="bg-white shadow rounded p-4 w-72" key={account.id}>
                                <p className="text-lg font-semibold text-gray-800">
                                    {account.name}
                                </p>
                                <p className="text-sm text-gray-400">Balance: {account.balance}</p>
                            </div>
                        ))}
                    {/* if no  */}
                    {accounts.filter((account) => account.type === "MISC").length === 0 && (
                        <p className="text-gray-400">No Miscellaneous accounts found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAccountPage;
