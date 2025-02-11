import { useOrg } from "@/providers/org-provider";

const DashboardPage = () => {
    const { organization } = useOrg();
    return (
        <div className="">
            <h1>Dashboard</h1>
            {organization && (
                <div className="">
                    <h2>{organization.name}</h2>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
