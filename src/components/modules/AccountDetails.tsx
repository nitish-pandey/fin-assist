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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const chequeColumns: ColumnDef<Transaction>[] = [
    {
        header: "Cheque Number",
        accessorKey: "details.chequeNumber",
    },
    {
        header: "Cheque Date",
        accessorKey: "details.chequeDate",
    },

    {
        header: "Cheque Issuer",
        accessorKey: "details.chequeIssuer",
    },
];

const AccountDetails = ({
    account,
    isLoading,
    error,
    type = "BANK",
}: AccountDetailsProps) => {
    const [localAccount, setLocalAccount] = useState<Account | null>(account);
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
            header: "Order ID",
            accessorKey: "orderId",
            cell: ({ row }) => {
                const orderId = row.original.orderId;
                return orderId ? (
                    <Link
                        to={`/org/${account?.organizationId}/orders/${orderId}`}
                        className="text-blue-500 hover:underline"
                    >
                        {orderId}
                    </Link>
                ) : (
                    "N/A"
                );
            },
        },
        {
            header: "Type",
            accessorKey: "type",
        },
        {
            header: "Date",
            accessorKey: "createdAt",
        },
    ];

    useEffect(() => {
        setLocalAccount(account);
    }, [account]);
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!account) {
        return <div>No account found</div>;
    }
    if (!localAccount) {
        return <div>No account found</div>;
    }

    const handleAddTransaction = async (
        amount: number,
        description: string,
        type: "BUY" | "SELL" | "MISC",
        details: object = {}
    ) => {
        const created = await api.post(
            `/orgs/${account.organizationId}/accounts/${account.id}/transactions`,
            {
                amount,
                type,
                description,
                details,
            }
        );
        setLocalAccount((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                balance:
                    prev.balance +
                    (type === "BUY" ? -amount : type === "SELL" ? amount : 0),
                transactions: [...(prev.transactions || []), created.data],
            };
        });
    };

    return (
        <div className="mt-8">
            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">
                    Account Details
                </h2>
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <p className="text-sm text-gray-500">Account Name</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {localAccount.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {localAccount.balance}
                        </p>
                    </div>
                    {type === "BANK" && (
                        <>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Account Number
                                </p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {localAccount.details.accountNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Bank Name
                                </p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {localAccount.details.bankName}
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
                            <TabsTrigger value="all">
                                All Transactions
                            </TabsTrigger>
                            <TabsTrigger value="buy">
                                Buy Transactions
                            </TabsTrigger>
                            <TabsTrigger value="sell">
                                Sell Transactions
                            </TabsTrigger>
                            <TabsTrigger value="others">
                                Other Transactions
                            </TabsTrigger>
                        </div>
                        <AddTransactionDialog
                            account={localAccount}
                            onAddTransaction={handleAddTransaction}
                        />
                    </TabsList>
                    <TabsContent value="all" defaultChecked>
                        <div>
                            {localAccount.transactions &&
                            localAccount.transactions.length > 0 ? (
                                <TableComponent
                                    title="All Payments"
                                    columns={
                                        type === "CHEQUE"
                                            ? [
                                                  ...paymentColumns,
                                                  ...chequeColumns,
                                              ]
                                            : paymentColumns
                                    }
                                    data={localAccount.transactions}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">
                                    No payments found.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="buy">
                        <div>
                            {localAccount.transactions &&
                            localAccount.transactions.filter(
                                (t) => t.orderId && t.type === "BUY"
                            ).length > 0 ? (
                                <TableComponent
                                    title="Buy Payments"
                                    columns={
                                        type === "CHEQUE"
                                            ? [
                                                  ...paymentColumns,
                                                  ...chequeColumns,
                                              ]
                                            : paymentColumns
                                    }
                                    data={localAccount.transactions.filter(
                                        (t) => t.type === "BUY" && t.orderId
                                    )}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">
                                    No buy payments found.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="sell">
                        <div>
                            {localAccount.transactions &&
                            localAccount.transactions.filter(
                                (t) => t.type === "SELL" && t.orderId
                            ).length > 0 ? (
                                <TableComponent
                                    title="Sell Payments"
                                    columns={
                                        type === "CHEQUE"
                                            ? [
                                                  ...paymentColumns,
                                                  ...chequeColumns,
                                              ]
                                            : paymentColumns
                                    }
                                    data={localAccount.transactions.filter(
                                        (t) => t.type === "SELL" && t.orderId
                                    )}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">
                                    No sell payments found.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="others">
                        <div>
                            {localAccount.transactions &&
                            localAccount.transactions.filter((t) => !t.orderId)
                                .length > 0 ? (
                                <TableComponent
                                    title="Other Payments"
                                    allowSearch={false}
                                    allowExport={false}
                                    allowPagination={false}
                                    // columns={[
                                    //     ...paymentColumns,
                                    //     {
                                    //         header: "Description",
                                    //         accessorKey: "description",
                                    //     },
                                    // ]}
                                    columns={
                                        type === "CHEQUE"
                                            ? [
                                                  ...paymentColumns,
                                                  ...chequeColumns,
                                              ]
                                            : paymentColumns
                                    }
                                    data={localAccount.transactions.filter(
                                        (t) => !t.orderId
                                    )}
                                />
                            ) : (
                                <p className="bg-white rounded-lg p-2">
                                    No other payments found.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AccountDetails;
