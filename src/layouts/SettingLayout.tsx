import { Outlet } from "react-router-dom";
import Sidebar from "../components/modules/Sidebar";
import { GoOrganization } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";

export type SidebarOptionType = {
    name: string;
    path?: string;
    icon: any;
    options?: SidebarOptionType[];
};

const SettingLayout = () => {
    const sidebarOptions: SidebarOptionType[] = [
        {
            name: "Profile",
            path: "/settings/profile",
            icon: <CgProfile />,
        },
        {
            name: "My Organizations",
            path: "/settings/orgs",
            icon: <GoOrganization />,
        },
        {
            name: "Logout",
            path: "/auth/logout",
            icon: <CiLogout />,
        },
    ];
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar sidebarOptions={sidebarOptions} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 mt-5">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingLayout;
