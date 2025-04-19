import PopUp from "@/components/modules/pop-up";
import Sidebar from "@/components/modules/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OrgProvider } from "@/providers/org-provider";
import { Outlet } from "react-router-dom";

export function MainLayout() {
    return (
        <OrgProvider>
            <SidebarProvider>
                <div className="flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <Sidebar />
                    <div className="flex flex-col w-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </SidebarProvider>
            <PopUp />
        </OrgProvider>
    );
}
