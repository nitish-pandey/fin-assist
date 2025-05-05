"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Team {
    id: string;
    name: string;
    logo: React.ReactElement;
    type: string;
    current: boolean;
}

interface TeamSwitcherProps {
    teams: Team[];
    onTeamChange?: (teamId: string) => void;
}

export function TeamSwitcher({ teams, onTeamChange }: TeamSwitcherProps) {
    const { isMobile } = useSidebar();
    const [open, setOpen] = React.useState(false);

    const currentTeam = React.useMemo(
        () => teams.find((team) => team.current) || teams[0],
        [teams]
    );

    // Early return if no teams
    if (!teams.length || !currentTeam) {
        return null;
    }

    const handleTeamSelect = (teamId: string) => {
        setOpen(false);
        if (onTeamChange) {
            onTeamChange(teamId);
        } else {
            // Redirect to the selected team dashboard
            window.location.href = `/org/${teamId}/dashboard`;
        }
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="transition-all duration-200 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border rounded-xl"
                            >
                                <TeamAvatar team={currentTeam} />
                                <div className="flex flex-col gap-0.5 text-left leading-none">
                                    <span className="font-medium">{currentTeam.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {currentTeam.type}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px] p-2"
                        >
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Your teams
                            </DropdownMenuLabel>
                            <div className="mt-2 max-h-[60vh] space-y-1 overflow-y-auto">
                                {teams.map((team) => (
                                    <DropdownMenuItem
                                        key={team.id}
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                                            team.current && "bg-accent/50 font-medium"
                                        )}
                                        onClick={() => handleTeamSelect(team.id)}
                                    >
                                        <TeamAvatar team={team} className="" />
                                        <span className="flex-1 truncate">{team.name}</span>
                                        {team.current && <Check className="h-4 w-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                            <DropdownMenuSeparator className="my-2" />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}

function TeamAvatar({ team, className }: { team: Team; className?: string }) {
    return (
        <Avatar className={cn("flex items-center justify-center border bg-muted", className)}>
            {team.logo}
        </Avatar>
    );
}
