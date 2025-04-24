import { Account, Transaction } from "@/data/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface AccountDetailsProps {
    type?: "BANK" | "BANK_OD" | "CASH_COUNTER" | "CHEQUE" | "MISC";
    account: Account | null;
    isLoading: boolean;
    error: string;
}

import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "./Table";
import { api } from "@/utils/api";
import { AddTransactionDialog } from "../modals/AddTransaction";

const paymentColumns: ColumnDef<Transaction>[] = [
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "Amount",
        accessorKey: "amount",
    },
    {
        header: "Date",
        accessorKey: "createdAt",
    },
];

const AccountDetails = ({ account, isLoading, error, type = "BANK" }: AccountDetailsProps) => {
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!account) {
        return <div>No account found</div>;
    }
    const handleAddTransaction = async (amount: number, description: string) => {
        await api.post(`/orgs/${account.organizationId}/accounts/${account.id}/transactions`, {
            amount,
            description,
        });
    };

    return (
        <div className="mt-8">
            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <p className="text-sm text-gray-500">Account Name</p>
                        <p className="text-lg font-semibold text-gray-800">{account.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-lg font-semibold text-gray-800">{account.balance}</p>
                    </div>
                    {type === "BANK" && (
                        <>
                            <div>
                                <p className="text-sm text-gray-500">Account Number</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {account.details.accountNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Bank Name</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {account.details.bankName}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 border border-gray-500 rounded-xl p-6">
                <Tabs defaultValue="all">
                    <TabsList className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <TabsTrigger value="all">All Transactions</TabsTrigger>
                            <TabsTrigger value="buy">Buy Transactions</TabsTrigger>
                            <TabsTrigger value="sell">Sell Transactions</TabsTrigger>
                            <TabsTrigger value="others">Other Transactions</TabsTrigger>
                        </div>
                        <AddTransactionDialog
                            account={account}
                            onAddTransaction={handleAddTransaction}
                        />
                    </TabsList>
                    <TabsContent value="all" defaultChecked>
                        <div>
                            {account.transactions && account.transactions.length > 0 ? (
                                <TableComponent
                                    title="All Payments"
                                    columns={paymentColumns}
                                    data={account.transactions}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">No payments found.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="buy">
                        <div>
                            {account.transactions &&
                            account.transactions.filter((t) => t.type === "BUY").length > 0 ? (
                                <TableComponent
                                    title="Buy Payments"
                                    columns={paymentColumns}
                                    data={account.transactions.filter((t) => t.type === "BUY")}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">No buy payments found.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="sell">
                        <div>
                            {account.transactions &&
                            account.transactions.filter((t) => t.type === "SELL").length > 0 ? (
                                <TableComponent
                                    title="Sell Payments"
                                    columns={paymentColumns}
                                    data={account.transactions.filter((t) => t.type === "SELL")}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">No sell payments found.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="others">
                        <div>
                            {account.transactions &&
                            account.transactions.filter((t) => t.type === "MISC").length > 0 ? (
                                <TableComponent
                                    title="Other Payments"
                                    allowSearch={false}
                                    allowExport={false}
                                    allowPagination={false}
                                    columns={[
                                        ...paymentColumns,
                                        {
                                            header: "Description",
                                            accessorKey: "description",
                                        },
                                    ]}
                                    data={account.transactions.filter((t) => t.type === "MISC")}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">No other payments found.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AccountDetails;
