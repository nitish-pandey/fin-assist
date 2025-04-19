import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/modules/dashboard-sidebar";
import { AuthProvider } from "@/providers/auth-provider";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <DashboardSidebar />
                    <main className="flex-1 overflow-y-auto bg-background w-full border">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </AuthProvider>
    );
}
