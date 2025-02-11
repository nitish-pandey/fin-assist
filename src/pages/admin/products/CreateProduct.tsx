import CreateProduct from "@/components/forms/CreateProduct";
import { useOrg } from "@/providers/org-provider";

const CreateProductPage = () => {
    const { orgId } = useOrg();

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <CreateProduct orgId={orgId} />
        </div>
    );
};

export default CreateProductPage;
