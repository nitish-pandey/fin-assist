import React, { useState } from "react";
import { RiCheckLine } from "react-icons/ri";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "../ui/dialog";

interface AcceptModalProps {
    title: string;
    description: string;
    onAccept: () => Promise<void> | void; // Support async actions
}

export const AcceptModal: React.FC<AcceptModalProps> = ({ title, description, onAccept }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const handleAccept = async () => {
        try {
            setLoading(true);
            await onAccept();
            toast({
                title: "Success",
                description: "Action accepted successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to accept action.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <RiCheckLine size={16} className="cursor-pointer text-green-500" />
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={loading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleAccept} variant="default" disabled={loading}>
                        {loading ? (
                            "Accepting..."
                        ) : (
                            <>
                                <RiCheckLine size={16} /> Accept
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
