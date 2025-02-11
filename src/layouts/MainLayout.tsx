import { AppSidebar } from "@/components/modules/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrgProvider } from "@/providers/org-provider";
import { Outlet } from "react-router-dom";

export function MainLayout() {
    return (
        <OrgProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="px-4">
                    <section className="container mx-auto max-w-7xl px-6 py-8">
                        <Outlet />
                    </section>
                </SidebarInset>
            </SidebarProvider>
        </OrgProvider>
    );
}
