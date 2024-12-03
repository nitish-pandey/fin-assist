"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { AddOrganizationForm } from "../modals/AddOrganization";

export function TeamSwitcher({
    teams,
}: {
    teams: {
        name: string;
        id: string;
        logo: React.ElementType;
        type: string;
        current: boolean;
    }[];
}) {
    const { isMobile } = useSidebar();
    const [activeTeam, setActiveTeam] = React.useState<
        | {
              name: string;
              id: string;
              logo: React.ElementType;
              type: string;
              current: boolean;
          }
        | undefined
    >(undefined);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setActiveTeam(teams.find((team) => team.current));
    }, [teams]);

    if (!activeTeam) {
        return null;
    }

    if (teams.length === 0) {
        return null;
    }

    const handleTeamClick = (team: typeof activeTeam) => {
        setActiveTeam(team);
        setIsOpen(false);
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <activeTeam.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeTeam.name}
                                </span>
                                <span className="truncate text-xs">
                                    {activeTeam.type}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Teams
                        </DropdownMenuLabel>
                        {teams.map((team) => (
                            <DropdownMenuItem
                                key={team.name}
                                onClick={() => handleTeamClick(team)}
                                className={`gap-2 p-2 border-2 rounded-lg 
                                ${
                                    team.current
                                        ? "bg-blue-500 text-white hover:bg-blue-800 hover:border-blue-500"
                                        : ""
                                }`}
                            >
                                <Link
                                    to={`/org/${team.id}/dashboard`}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <team.logo className="size-4 shrink-0" />
                                    </div>
                                    {team.name}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <AddOrganizationForm />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
