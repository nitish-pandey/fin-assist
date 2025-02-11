import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
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

interface RemoveModalProps {
    title: string;
    description: string;
    onRemove: () => Promise<void> | void; // Support async actions
}

export const RemoveModal: React.FC<RemoveModalProps> = ({ title, description, onRemove }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const handleRemove = async () => {
        try {
            setLoading(true);
            await onRemove();
            toast({
                title: "Success",
                description: "Item removed successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove item.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <RiDeleteBin6Line size={16} className="cursor-pointer text-red-500" />
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
                    <Button onClick={handleRemove} variant="destructive" disabled={loading}>
                        {loading ? (
                            "Removing..."
                        ) : (
                            <>
                                <RiDeleteBin6Line size={16} /> Remove
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
