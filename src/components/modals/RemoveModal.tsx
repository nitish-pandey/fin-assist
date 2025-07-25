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
    text?: string; // Optional text prop for additional information
    onRemove: () => Promise<void> | void; // Support async actions
}

export const RemoveModal: React.FC<RemoveModalProps> = ({
    title,
    description,
    onRemove,
    text,
}) => {
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
            // close the dialog after successful removal
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
                <div className="flex gap-2 items-center cursor-pointer text-red-500 hover:text-red-700">
                    <RiDeleteBin6Line
                        size={16}
                        className="cursor-pointer text-red-500"
                    />
                    <span className="">{text}</span>
                </div>
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
                    <Button
                        onClick={handleRemove}
                        variant="destructive"
                        disabled={loading}
                    >
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
