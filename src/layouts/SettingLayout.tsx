import { Link, Outlet } from "react-router-dom";
import { SidebarFooter, SidebarProvider } from "@/components/ui/sidebar";
import { Home, Inbox, LogOut } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    // SidebarTrigger,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const SettingLayout = () => {
    const items = [
        {
            title: "Profile",
            url: "/settings/profile",
            icon: Home,
        },
        {
            title: "Orgs",
            url: "/settings/orgs",
            icon: Inbox,
        },
        {
            title: "Invites",
            url: "/settings/invites",
            icon: Inbox,
        },
    ];
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Link to="/auth/logout" className="flex items-center gap-2">
                                    <LogOut />
                                    <span>Logout</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* <SidebarTrigger /> */}
                <Outlet />
            </main>
        </SidebarProvider>
    );
};

export default SettingLayout;
