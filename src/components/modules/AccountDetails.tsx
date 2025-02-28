import { Account, Transaction } from "@/data/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
interface AccountDetailsProps {
    account: Account | null;
    isLoading: boolean;
    error: string;
}

import { ColumnDef } from "@tanstack/react-table";
import { TableComponent } from "./Table";

const paymentColumns: ColumnDef<Transaction>[] = [
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "Type",
        accessorKey: "type",
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

const AccountDetails = ({ account, isLoading, error }: AccountDetailsProps) => {
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!account) {
        return <div>No account found</div>;
    }

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
                    <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {account.details.bankName}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-4 border border-gray-500 rounded-xl p-6">
                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Transactions</TabsTrigger>
                        <TabsTrigger value="buy">Buy Transactions</TabsTrigger>
                        <TabsTrigger value="sell">Sell Transactions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" defaultChecked>
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {account.transactions && account.transactions.length === 0 ? (
                                        <TableComponent
                                            columns={paymentColumns}
                                            data={account.transactions}
                                        />
                                    ) : (
                                        <p>No payments found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="buy">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Buy Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {account.transactions && account.transactions.length === 0 ? (
                                        <TableComponent
                                            columns={paymentColumns}
                                            data={account.transactions}
                                        />
                                    ) : (
                                        <p>No buy payments found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="sell">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sell Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {account.transactions && account.transactions.length === 0 ? (
                                        <TableComponent
                                            columns={paymentColumns}
                                            data={account.transactions}
                                        />
                                    ) : (
                                        <p>No sell payments found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AccountDetails;
