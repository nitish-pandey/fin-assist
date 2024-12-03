import { AppSidebar } from "@/components/modules/AppSidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="px-4">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 light text-white" />
                    </div>
                </header>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
