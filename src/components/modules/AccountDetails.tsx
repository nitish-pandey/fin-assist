import { Account } from "@/data/types";

interface AccountDetailsProps {
    account: Account | null;
    isLoading: boolean;
    error: string;
}

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
        <div className="flex flex-col gap-2">
            <div>
                <span className="font-semibold">Account Number:</span>{" "}
                {account.details.accountNumber}
            </div>
            <div>
                <span className="font-semibold">Bank Name:</span> {account.details.bankName}
            </div>
        </div>
    );
};

export default AccountDetails;
