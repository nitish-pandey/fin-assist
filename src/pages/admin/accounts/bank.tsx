import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Account } from "@/data/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountCard from "@/components/cards/AccountCard";
import AccountDetails from "@/components/modules/AccountDetails";

export default function BankAccounts() {
    const { orgId } = useOrg();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await api.get(`orgs/${orgId}/accounts`);
            setAccounts(data);
            setLoading(false);
            if (data.length > 0) {
                setSelectedAccount(data[0]);
            }
        };
        fetchAccounts();
    }, [orgId]);

    return (
        <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">Bank Accounts</h2>
                    <p className="text-sm text-gray-400">
                        View and manage all of your bank accounts here
                    </p>
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
                                onClick={() => setSelectedAccount(account)}
                                isSelected={selectedAccount?.id === account.id}
                            />
                        ))}
                </div>
            </div>
            {selectedAccount && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800">Account Details</h2>
                    <AccountDetails account={selectedAccount} isLoading={loading} error={error} />
                </div>
            )}
        </div>
    );
}
