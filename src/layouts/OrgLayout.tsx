import { Outlet, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/modules/Sidebar";
import { Header } from "../components/modules/Header";
// import {
//     FaUsers,
//     FaCircleInfo,
//     AiOutlineProduct,
//     IoAddCircleSharp,
//     CiCircleList,
//     GiStockpiles,
//     LuLayoutDashboard,
// } from "react-icons/";
import { FaUsers, FaCircleInfo } from "react-icons/fa6";
import { AiOutlineProduct } from "react-icons/ai";
import { IoAddCircleSharp } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";
import { GiStockpiles } from "react-icons/gi";
import { LuLayoutDashboard } from "react-icons/lu";
import { useGlobalContext } from "../providers/ConfigProvider";
import { OrganizationType, PermissionType } from "../data/types";
import { useMemo } from "react";

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
    const { organization, permissions, profile } = useGlobalContext();

    if (!orgId) {
        navigate("/auth/login", { replace: true });
        return <div>Redirecting...</div>;
    }

    const isOwner = useMemo(
        () =>
            organization?.some(
                (org: OrganizationType) =>
                    org.id === orgId && org.ownerId === profile?.id.toString()
            ),
        [organization, orgId, profile?.id]
    );

    const hasPermission = useMemo(
        () => (requiredPermission: string) =>
            permissions?.some(
                (perm: PermissionType) =>
                    perm.organizationId === orgId &&
                    perm.access === requiredPermission.toString()
            ),
        [permissions, orgId]
    );
    const getSidebarOptions = () => [
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
    ];

    const filterSidebarOptions = (
        options: SidebarOptionType[]
    ): SidebarOptionType[] =>
        options
            .filter((option) => option.visible !== false)
            .map((option) => ({
                ...option,
                options: option.options
                    ? filterSidebarOptions(option.options)
                    : undefined,
            }));

    const sidebarOptions = useMemo(
        () => filterSidebarOptions(getSidebarOptions()),
        [getSidebarOptions]
    );

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
