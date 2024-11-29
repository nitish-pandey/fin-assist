import { Outlet } from "react-router-dom";
import Sidebar from "../components/modules/Sidebar";
import { Header } from "../components/modules/Header";
import { useParams, useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { AiOutlineProduct } from "react-icons/ai";
import { IoAddCircleSharp } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";
import { GiStockpiles } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";

export type SidebarOptionType = {
    name: string;
    path?: string;
    icon: any;
    options?: SidebarOptionType[];
};

const OrgLayout = () => {
    const { orgId } = useParams() as { orgId: string };
    const navigate = useNavigate();
    if (!orgId) {
        navigate("/auth/login");
    }

    const sidebarOptions: SidebarOptionType[] = [
        {
            name: "Dashboard",
            path: `/org/${orgId}/dashboard`,
            icon: LuLayoutDashboard,
        },
        {
            name: "Info",
            path: `/org/${orgId}/info`,
            icon: FaCircleInfo,
        },
        {
            name: "Users",
            path: `/org/${orgId}/users`,
            icon: FaUsers,
        },
        {
            name: "Product",
            icon: AiOutlineProduct,
            options: [
                {
                    name: "Add Product",
                    icon: IoAddCircleSharp,
                    path: `/org/${orgId}/add-product`,
                },
                {
                    name: "View Products",
                    path: `/org/${orgId}/view-products`,
                    icon: CiCircleList,
                },
            ],
        },
        {
            name: "Stock",
            icon: GiStockpiles,
            options: [
                {
                    name: "Add Stock",
                    icon: IoAddCircleSharp,
                    path: `/org/${orgId}/add-stock`,
                },
                {
                    name: "View Stock",
                    icon: CiCircleList,
                    path: `/org/${orgId}/view-stock`,
                },
            ],
        },
    ];
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
