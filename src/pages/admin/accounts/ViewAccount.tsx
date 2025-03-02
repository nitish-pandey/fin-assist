import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Account } from "@/data/types";
import { useEffect, useState } from "react";
import AccountCard from "@/components/cards/AccountCard";
import CreateAccountForm from "@/components/forms/CreateAccountForm";

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

    const onSubmit = async (account: Account) => {
        await api.post(`orgs/${orgId}/accounts`, account);
    };

    return (
        <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">Accounts</h2>
                    <p className="text-sm text-gray-400">View and manage accounts</p>
                </div>
                <CreateAccountForm
                    onSubmit={onSubmit}
                    avoidCashCounter={
                        accounts.filter((account) => account.type === "CASH_COUNTER").length > 0
                    }
                />
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
                    {accounts.filter((account) => account.type === "BANK").length === 0 && (
                        <div className="bg-white shadow rounded p-4 w-72">
                            <div className="flex items-center justify-center">
                                <p className="text-gray-400">No bank accounts found</p>
                            </div>
                        </div>
                    )}
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
                    {accounts.filter((account) => account.type === "BANK_OD").length === 0 && (
                        <div className="bg-white rounded p-4 w-72">
                            <div className="flex items-center justify-center">
                                <p className="text-gray-400">No bank OD accounts found</p>
                            </div>
                        </div>
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
                    {accounts.filter((account) => account.type === "CASH_COUNTER").length === 0 && (
                        <div className="bg-white rounded p-4 w-72">
                            <div className="flex items-center justify-center">
                                <p className="text-gray-400">No cash accounts found</p>
                            </div>
                        </div>
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
                    {accounts.filter((account) => account.type === "CHEQUE").length === 0 && (
                        <div className="bg-white rounded p-4 w-72">
                            <div className="flex items-center justify-center">
                                <p className="text-gray-400">No cheque accounts found</p>
                            </div>
                        </div>
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
                    {accounts.filter((account) => account.type === "MISC").length === 0 && (
                        <div className="bg-white rounded p-4 w-72">
                            <div className="flex items-center justify-center">
                                <p className="text-gray-400">No miscellaneous accounts found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAccountPage;
