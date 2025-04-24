// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { User, Building2, Mail, LogOut } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
    const pathname = useLocation().pathname;

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <Sidebar>
            <SidebarHeader className="border-b">
                <div className="flex items-center p-2">
                    <Link to="/profile" className="flex items-center gap-2 font-semibold">
                        <Building2 className="h-6 w-6" />
                        <span className="text-xl">Profile</span>
                    </Link>
                    <SidebarTrigger className="ml-auto md:hidden" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/profile")}>
                                    <Link to="/profile">
                                        <User />
                                        <span>Profile</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive("/profile/organizations")}
                                >
                                    <Link to="/profile/orgs">
                                        <Building2 />
                                        <span>Organizations</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/profile/invites")}>
                                    <Link to="/profile/invites">
                                        <Mail />
                                        <span>Invites</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t">
                <Link to="/logout" className="flex items-center p-2 gap-2">
                    <LogOut className="h-6 w-6 text-red-500" />
                    <span className="text-red-500">Logout</span>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
