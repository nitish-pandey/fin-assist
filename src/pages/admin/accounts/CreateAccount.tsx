import { useOrg } from "@/providers/org-provider";
import { Account } from "@/data/types";
import CreateAccountForm from "@/components/forms/CreateAccountForm";
import { api } from "@/utils/api";

const CreateAccountPage = () => {
    const { orgId } = useOrg();

    const onSubmit = async (account: Account) => {
        await api.post(`orgs/${orgId}/accounts`, account);
    };

    return (
        <div className="container max-w-7xl mx-auto p-4">
            <CreateAccountForm onSubmit={onSubmit} />
        </div>
    );
};

export default CreateAccountPage;
