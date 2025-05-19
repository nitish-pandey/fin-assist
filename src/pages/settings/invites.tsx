"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Invite } from "@/data/types";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/utils/api";

export default function InvitesPage() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionInvite, setActionInvite] = useState<Invite | null>(null);
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();

    const fetchInvites = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`users/${userId}/invites`);
            setInvites(response.data);
        } catch (error) {
            console.error("Error fetching invites:", error);
            setError("Failed to load invitations. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchInvites(user.id);
        }
    }, [user]);

    const handleAcceptInvite = async () => {
        if (!actionInvite || !user?.id) return;

        setIsProcessing(true);

        try {
            await api.post(`users/${user.id}/invites/accept`, {
                inviteId: actionInvite.id,
            });

            setInvites(
                invites.map((invite) =>
                    invite.id === actionInvite.id
                        ? { ...invite, status: "ACCEPTED", updatedAt: new Date().toISOString() }
                        : invite
                )
            );

            toast({
                title: "Invite accepted",
                description: `You have joined ${actionInvite.organization?.name}.`,
            });
        } catch (error) {
            console.error("Error accepting invite:", error);
            toast({
                title: "Failed to accept invite",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
            setIsAcceptDialogOpen(false);
            setActionInvite(null);
        }
    };

    const handleRejectInvite = async () => {
        if (!actionInvite || !user?.id) return;

        setIsProcessing(true);

        try {
            await api.post(`users/${user.id}/invites/reject`, {
                inviteId: actionInvite.id,
            });

            setInvites(
                invites.map((invite) =>
                    invite.id === actionInvite.id
                        ? { ...invite, status: "REJECTED", updatedAt: new Date().toISOString() }
                        : invite
                )
            );

            toast({
                title: "Invite rejected",
                description: `You have rejected the invitation from ${actionInvite.organization?.name}.`,
            });
        } catch (error) {
            console.error("Error rejecting invite:", error);
            toast({
                title: "Failed to reject invite",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
            setIsRejectDialogOpen(false);
            setActionInvite(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 flex items-center gap-1 font-medium"
                    >
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                    </Badge>
                );
            case "ACCEPTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 flex items-center gap-1 font-medium"
                    >
                        <CheckCircle className="h-3 w-3" />
                        <span>Accepted</span>
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 flex items-center gap-1 font-medium"
                    >
                        <XCircle className="h-3 w-3" />
                        <span>Rejected</span>
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 flex items-center gap-1 font-medium"
                    >
                        <Clock className="h-3 w-3" />
                        <span>Expired</span>
                    </Badge>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const renderTableContent = () => {
        if (loading) {
            return <TableSkeleton />;
        }

        if (error) {
            return (
                <div className="py-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            );
        }

        if (invites.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No invitations</h3>
                    <p className="text-muted-foreground max-w-sm">
                        You don't have any pending invitations to organizations at the moment.
                    </p>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invites.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell className="font-medium">
                                {invite.organization?.name}
                            </TableCell>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell>{formatDate(invite.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(invite.status)}</TableCell>
                            <TableCell>
                                {invite.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setActionInvite(invite);
                                                setIsAcceptDialogOpen(true);
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setActionInvite(invite);
                                                setIsRejectDialogOpen(true);
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
                <p className="text-muted-foreground mt-1">Manage your organization invitations</p>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Your Invitations</CardTitle>
                    <CardDescription>View and respond to organization invitations</CardDescription>
                </CardHeader>
                <CardContent>{renderTableContent()}</CardContent>
            </Card>

            {/* Accept Dialog */}
            <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accept Invitation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to accept this invitation from{" "}
                            <span className="font-medium">{actionInvite?.organization?.name}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAcceptDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAcceptInvite} disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Accept"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Invitation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this invitation from{" "}
                            <span className="font-medium">{actionInvite?.organization?.name}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectInvite}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-full" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-[20%]" />
                    <Skeleton className="h-12 w-[20%]" />
                    <Skeleton className="h-12 w-[15%]" />
                    <Skeleton className="h-12 w-[15%]" />
                    <Skeleton className="h-12 w-[30%]" />
                </div>
            ))}
        </div>
    );
}
