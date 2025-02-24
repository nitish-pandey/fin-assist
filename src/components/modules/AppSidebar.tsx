"use client";

import * as React from "react";
import { Notebook } from "lucide-react";

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
import { getDropDownItems, getMainNavItems } from "@/utils/sidebarItems";

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

    const teams = [...ownedOrgs, ...permittedOrgs];
    const userData = {
        name: user?.name || "John Doe",
        email: user?.email || "email@domain.com",
        avatar: "https://i.pras.co/100",
    };

    const mainNavItems = getMainNavItems(orgId || "");
    const dropDownItems = getDropDownItems(orgId || "");

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavProjects projects={mainNavItems} />
                <NavMain items={dropDownItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
