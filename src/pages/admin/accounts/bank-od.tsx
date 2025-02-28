import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Account } from "@/data/types";
import AccountCard from "@/components/cards/AccountCard";
import AccountDetails from "@/components/modules/AccountDetails";
import CreateAccountForm from "@/components/forms/CreateAccountForm";

export default function BankODAccounts() {
    const { orgId } = useOrg();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Fetch accounts from API
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Account[]>(`orgs/${orgId}/accounts`);
            const filteredAccounts = data.filter((acc) => acc.type === "BANK");
            setAccounts(filteredAccounts);
            if (filteredAccounts.length > 0) {
                setSelectedAccount(filteredAccounts[0]);
            }
        } catch (err) {
            setError("Failed to fetch bank accounts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Create a new account
    const onSubmit = async (account: Account) => {
        try {
            await api.post(`orgs/${orgId}/accounts`, account);
            fetchAccounts(); // Refresh the account list
        } catch {
            setError("Failed to create account. Please try again.");
        }
    };

    return (
        <div className="container mx-auto max-w-6xl px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Bank OverDraft Accounts</h2>
                    <p className="text-sm text-gray-500">View and manage your bank-od accounts</p>
                </div>
                <CreateAccountForm type="BANK_OD" onSubmit={onSubmit} disableType={true} />
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">Loading bank-od accounts...</p>
                </div>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : accounts.length === 0 ? (
                <p className="text-center text-gray-500 mt-6">No bank-od accounts found.</p>
            ) : (
                <>
                    {/* Account List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {accounts.map((account) => (
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

                    {/* Account Details */}
                    {selectedAccount && (
                        <div className="mt-8">
                            <AccountDetails
                                account={selectedAccount}
                                isLoading={loading}
                                error={error || ""}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
