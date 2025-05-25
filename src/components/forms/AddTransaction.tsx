import React, { useEffect, useState } from "react";
import { Account } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/utils/api";

interface AddTransactionProps {
    remainingBalance: number;
    orgId: string;
    orderId: string;
    refetch: () => Promise<void>;
}

const AddTransaction: React.FC<AddTransactionProps> = ({
    remainingBalance,
    orgId,
    orderId,
    refetch,
}) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [accountType, setAccountType] = useState<string>("");

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get<Account[]>(`/orgs/${orgId}/accounts`);
                setAccounts(res.data);
                if (res.data.length > 0) {
                    setSelectedAccount(res.data[0].id);
                    setAccountBalance(res.data[0].balance);
                    setAccountType(res.data[0].type);
                }
            } catch (err) {
                setError("Failed to load accounts");
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [orgId]);

    useEffect(() => {
        const selectedAcc = accounts.find((acc) => acc.id === selectedAccount);
        if (selectedAcc) {
            setAccountBalance(selectedAcc.balance);
            setAccountType(selectedAcc.type);
        }
    }, [selectedAccount, accounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > remainingBalance) {
            setError("Amount exceeds remaining balance");
            return;
        }
        console.log({ amount, selectedAccount, orderId });
        // Handle form submission (e.g., API call)
        api.post(`/orgs/${orgId}/orders/${orderId}/transactions`, {
            amount,
            accountId: selectedAccount,
        });
        await refetch();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Transaction</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add Transaction</DialogTitle>
                <p>Remaining Balance: Rs {remainingBalance.toFixed(2)}</p>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label htmlFor="amount">Amount</label>
                    <Input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        required
                    />
                    <label htmlFor="account">Account</label>
                    <Select
                        value={selectedAccount}
                        onValueChange={setSelectedAccount}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            {accounts.find((acc) => acc.id === selectedAccount)?.name ||
                                "Select an account"}{" "}
                            - Rs {accountBalance.toFixed(2)} ({accountType})
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} - Rs {account.balance.toFixed(2)} ({account.type}
                                    )
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit">Submit</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddTransaction;
