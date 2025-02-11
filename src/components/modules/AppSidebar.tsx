"use client";

import * as React from "react";
import { BookOpen, Info, LayoutDashboard, Notebook, SendToBackIcon, Users } from "lucide-react";

import { NavMain } from "../nav/Main";
import { NavProjects } from "../nav/Projects";
import { NavUser } from "../nav/User";
import { TeamSwitcher } from "../nav/TeamSwitcher";
import { useParams } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";

interface OrgData {
    id: string;
    name: string;
    logo: React.ElementType;
    type: string;
    current: boolean;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { orgId } = useParams<{ orgId: string }>();
    const { user, orgs, permissions } = useAuth();

    const ownedOrgs: OrgData[] =
        orgs
            ?.filter((org) => org.id !== undefined)
            .map((org) => ({
                id: org.id as string,
                name: org.name,
                logo: Notebook,
                type: "Owned",
                current: org.id === orgId,
            })) || [];
    const permittedOrgs: OrgData[] =
        permissions?.map((perm) => ({
            id: perm.organizationId,
            name: perm.organizationId || "Organization",
            logo: Notebook,
            type: "Shared",
            current: perm.organizationId == orgId,
        })) || [];

    const data = {
        user: {
            name: user?.name || "John Doe",
            email: user?.email || "email@domain.com",
            avatar: "https://i.pras.co/100",
        },
        teams: [...ownedOrgs, ...permittedOrgs],
        navMain: [
            {
                title: "Accounts",
                url: "/org/" + orgId + "/accounts/list",
                icon: SendToBackIcon,
                isActive: true,
                items: [
                    {
                        title: "View",
                        url: "/org/" + orgId + "/accounts/view",
                    },
                    {
                        title: "Create",
                        url: "/org/" + orgId + "/accounts/create",
                    },
                ],
            },
            {
                title: "Products",
                url: "#",
                icon: Notebook,
                isActive: true,
                items: [
                    {
                        title: "Categories",
                        url: "/org/" + orgId + "/categories",
                    },
                    {
                        title: "Products",
                        url: "/org/" + orgId + "/products/list",
                    },
                    {
                        title: "Add Product",
                        url: "/org/" + orgId + "/products/create",
                    },
                ],
            },
            {
                title: "Orders",
                url: "#",
                icon: BookOpen,
                isActive: true,
                items: [
                    {
                        title: "Add",
                        url: "/org/" + orgId + "/orders/create",
                    },
                    {
                        title: "View",
                        url: "/org/" + orgId + "/orders/view",
                    },
                ],
            },
        ],
        projects: [
            {
                name: "Dashboard",
                url: "/org/" + orgId + "/dashboard",
                icon: LayoutDashboard,
            },
            {
                name: "Info",
                url: "/org/" + orgId + "/info",
                icon: Info,
            },
            {
                name: "Users",
                url: "/org/" + orgId + "/users",
                icon: Users,
            },
            {
                name: "Entity",
                url: "/org/" + orgId + "/entity",
                icon: Notebook,
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavProjects projects={data.projects} />
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
