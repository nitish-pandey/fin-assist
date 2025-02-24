import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";
import { Account } from "@/data/types";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AccountCard from "@/components/cards/AccountCard";
import CreateAccountForm from "@/components/forms/CreateAccountForm";
import { Plus } from "lucide-react";

interface EmptyAccountCardProps {
    text?: string;
    onClick: () => void;
}

const EmptyAccountCard = ({ onClick, text }: EmptyAccountCardProps) => {
    return (
        <div
            className="bg-white flex gap-2 min-h-40 items-center justify-center border border-gray-400 rounded-xl p-4 w-72 cursor-pointer"
            onClick={onClick}
        >
            <Plus />
            <p className="text-sm text-gray-600">{text || "Add a Account"}</p>
        </div>
    );
};

const ViewAccountPage = () => {
    const { orgId } = useOrg();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const createButtonRef = useRef<HTMLButtonElement>(null);

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

    const triggerButton = () => {
        createButtonRef.current?.click();
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
                    ref={createButtonRef}
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
                    <EmptyAccountCard onClick={triggerButton} text="Add a bank account" />
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
                    <EmptyAccountCard onClick={() => {}} />
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
                    <EmptyAccountCard onClick={() => {}} />
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
                    <EmptyAccountCard onClick={() => {}} />
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
                    <EmptyAccountCard onClick={() => {}} />
                </div>
            </div>
        </div>
    );
};

export default ViewAccountPage;
