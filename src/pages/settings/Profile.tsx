"use client";

import { useAuth } from "@/providers/auth-provider";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, UserIcon } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <div className="text-center py-8">Loading profile...</div>;
    }

    return (
        <div className="p-6 space-y-6 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">View and manage your user profile</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Your personal information and account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src="/placeholder.svg?height=64&width=64"
                                        alt={user.name}
                                    />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        User ID: {user.id}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Edit Profile</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Summary</CardTitle>
                        <CardDescription>Overview of your account activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border p-3">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Organizations
                                </div>
                                <div className="text-2xl font-bold">
                                    {user.organizations?.length || 0}
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Permissions
                                </div>
                                <div className="text-2xl font-bold">
                                    {user.permissions?.length || 0}
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Last Login
                                </div>
                                <div className="text-sm font-medium">Today, 2:30 PM</div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Account Status
                                </div>
                                <div className="text-sm font-medium text-green-500">Active</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">
                            View Activity Log
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
