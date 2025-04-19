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
import type { Invite } from "@/data/types";

export default function InvitesPage() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionInvite, setActionInvite] = useState<Invite | null>(null);
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    useEffect(() => {
        // Simulate fetching invites
        const fetchInvites = async () => {
            try {
                // In a real app, you would fetch from your API
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Mock data
                setInvites([
                    {
                        id: "1",
                        organizationId: "1",
                        email: "jane.smith@example.com",
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        organization: {
                            id: "1",
                            name: "Acme Inc",
                            ownerId: "1",
                            description: "A software development company",
                        },
                    },
                    {
                        id: "2",
                        organizationId: "1",
                        email: "mark.johnson@example.com",
                        status: "ACCEPTED",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        organization: {
                            id: "1",
                            name: "Acme Inc",
                            ownerId: "1",
                            description: "A software development company",
                        },
                    },
                    {
                        id: "3",
                        organizationId: "2",
                        email: "sarah.wilson@example.com",
                        status: "REJECTED",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        organization: {
                            id: "2",
                            name: "Globex Corporation",
                            ownerId: "1",
                            description: "A global technology company",
                        },
                    },
                    {
                        id: "4",
                        organizationId: "2",
                        email: "robert.brown@example.com",
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        organization: {
                            id: "2",
                            name: "Globex Corporation",
                            ownerId: "1",
                            description: "A global technology company",
                        },
                    },
                ]);
            } catch (error) {
                console.error("Error fetching invites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvites();
    }, []);

    const handleAcceptInvite = () => {
        if (!actionInvite) return;

        // In a real app, you would call your API
        setInvites(
            invites.map((invite) =>
                invite.id === actionInvite.id
                    ? { ...invite, status: "ACCEPTED", updatedAt: new Date().toISOString() }
                    : invite
            )
        );

        toast({
            title: "Invite accepted",
            description: `You have accepted the invitation from ${actionInvite.organization?.name}.`,
        });

        setIsAcceptDialogOpen(false);
        setActionInvite(null);
    };

    const handleRejectInvite = () => {
        if (!actionInvite) return;

        // In a real app, you would call your API
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

        setIsRejectDialogOpen(false);
        setActionInvite(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending
                    </Badge>
                );
            case "ACCEPTED":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        Accepted
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        Rejected
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Expired
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading invites...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invites</h1>
                <p className="text-muted-foreground">Manage your organization invitations</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Invitations</CardTitle>
                    <CardDescription>Invitations to join organizations</CardDescription>
                </CardHeader>
                <CardContent>
                    {invites.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No invitations found
                        </div>
                    ) : (
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
                                        <TableCell>
                                            {new Date(invite.createdAt).toLocaleDateString()}
                                        </TableCell>
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
                    )}
                </CardContent>
            </Card>

            {/* Accept Dialog */}
            <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accept Invitation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to accept this invitation from{" "}
                            {actionInvite?.organization?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAcceptInvite}>Accept</Button>
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
                            {actionInvite?.organization?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRejectInvite}>
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
