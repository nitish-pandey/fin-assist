"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";

export default function LogoutPage() {
    const router = useNavigate();
    const { toast } = useToast();
    const [countdown, setCountdown] = useState(3);
    const [isLoggingOut] = useState(true);
    const [logoutComplete, setLogoutComplete] = useState(false);

    // Handle the logout process
    const performLogout = async () => {
        try {
            // Clear cookies
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            // Clear storage
            localStorage.clear();
            sessionStorage.clear();

            // Call logout API
            await api.post("/users/logout", {}, { withCredentials: true });

            setLogoutComplete(true);

            toast({
                title: "Logged out successfully",
                description: "You have been securely logged out of your account.",
                variant: "default",
            });
        } catch (error) {
            console.error("Logout error:", error);
            toast({
                title: "Logout issue",
                description: "There was a problem logging you out. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle countdown and navigation
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isLoggingOut) {
            // Perform logout immediately
            performLogout();

            // Start countdown
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router("/auth/login");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isLoggingOut]);

    // Calculate progress percentage
    const progressPercentage = ((3 - countdown) / 3) * 100;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-2">
                        {logoutComplete ? (
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        ) : (
                            <LogOut className="h-12 w-12 text-slate-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Logging Out</CardTitle>
                    <CardDescription className="text-center">
                        {logoutComplete
                            ? "You have been successfully logged out"
                            : "Securely logging you out of your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Progress value={progressPercentage} className="h-2" />
                        <p className="text-center text-sm text-muted-foreground">
                            Redirecting to login page in {countdown} seconds...
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router("/auth/login")}
                    >
                        Go to Login Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
