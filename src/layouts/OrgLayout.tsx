import { Outlet, useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Sidebar from "../components/modules/Sidebar";
import { Header } from "../components/modules/Header";
import { FaUsers, FaCircleInfo } from "react-icons/fa6";
import { AiOutlineProduct } from "react-icons/ai";
import { IoAddCircleSharp } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";
import { GiStockpiles } from "react-icons/gi";
import { LuLayoutDashboard } from "react-icons/lu";
import { useAuth } from "../providers/ConfigProvider";
import { OrganizationSchema, RoleAccessSchema } from "../data/types";

export type SidebarOptionType = {
    name: string;
    path?: string;
    icon: React.ReactNode;
    options?: SidebarOptionType[];
    visible?: boolean;
};

const OrgLayout = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const navigate = useNavigate();
    const { error, isUpdating, authenticated, profile } = useAuth();

    // // Redirect to login if orgId is missing or user is unauthenticated
    // if (!orgId || !authenticated) {
    //     navigate("/auth/login", { replace: true });
    //     return <div>Redirecting...</div>;
    // }

    // Check if the current user is the owner of the organization
    const isOwner = useMemo(
        () =>
            profile?.organizations?.some(
                (org: OrganizationSchema) =>
                    org.id === orgId && org.ownerId === profile?.id.toString()
            ),
        [profile, orgId]
    );

    // Check if the user has a specific permission for the organization
    const hasPermission = useMemo(
        () => (requiredPermission: string) =>
            profile?.permissions?.some(
                (perm: RoleAccessSchema) =>
                    perm.organizationId === orgId &&
                    perm.access === requiredPermission.toString()
            ),
        [profile, orgId]
    );

    // Define the sidebar options dynamically
    const getSidebarOptions = useMemo(
        () => [
            {
                name: "Dashboard",
                path: `/org/${orgId}/dashboard`,
                icon: <LuLayoutDashboard />,
                visible: isOwner || hasPermission("VIEW_ORG"),
            },
            {
                name: "Info",
                path: `/org/${orgId}/info`,
                icon: <FaCircleInfo />,
                visible: isOwner || hasPermission("VIEW_ORG"),
            },
            {
                name: "Users",
                path: `/org/${orgId}/users`,
                icon: <FaUsers />,
                visible: isOwner || hasPermission("VIEW_USER"),
            },
            {
                name: "Product",
                icon: <AiOutlineProduct />,
                visible: isOwner || hasPermission("VIEW_PRODUCT"),
                options: [
                    {
                        name: "Add Product",
                        icon: <IoAddCircleSharp />,
                        path: `/org/${orgId}/add-product`,
                        visible: isOwner || hasPermission("MANAGE_PRODUCT"),
                    },
                    {
                        name: "View Products",
                        icon: <CiCircleList />,
                        path: `/org/${orgId}/view-products`,
                        visible: isOwner || hasPermission("VIEW_PRODUCT"),
                    },
                ],
            },
            {
                name: "Stock",
                icon: <GiStockpiles />,
                visible: isOwner || hasPermission("VIEW_STOCK"),
                options: [
                    {
                        name: "Add Stock",
                        icon: <IoAddCircleSharp />,
                        path: `/org/${orgId}/add-stock`,
                        visible: isOwner || hasPermission("MANAGE_STOCK"),
                    },
                    {
                        name: "View Stock",
                        icon: <CiCircleList />,
                        path: `/org/${orgId}/view-stock`,
                        visible: isOwner || hasPermission("VIEW_STOCK"),
                    },
                ],
            },
        ],
        [orgId, isOwner, hasPermission]
    );

    // Filter visible sidebar options
    const filterSidebarOptions = (
        options: SidebarOptionType[]
    ): SidebarOptionType[] =>
        options
            .filter((option) => option.visible)
            .map((option) => ({
                ...option,
                options: option.options
                    ? filterSidebarOptions(option.options)
                    : undefined,
            }));

    const sidebarOptions = useMemo(
        () => filterSidebarOptions(getSidebarOptions),
        [getSidebarOptions]
    );

    // Display loading state while updating profile or permissions
    if (isUpdating) {
        return <div>Loading...</div>;
    }

    // Handle errors gracefully
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar sidebarOptions={sidebarOptions} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header orgId={orgId} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 mt-5">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrgLayout;
