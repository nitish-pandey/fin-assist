import type React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddCategoryProps {
    onAddCategory: (name: string, description: string) => Promise<void>;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onAddCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({ name: "", description: "" });
    const { toast } = useToast();

    const validateForm = () => {
        const newErrors = { name: "", description: "" };
        let isValid = true;

        if (!name.trim()) {
            newErrors.name = "Name is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setErrors({ name: "", description: "" });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onAddCategory(name, description);
            toast({
                title: "Category Created",
                description: "Category has been created successfully",
            });
            setIsOpen(false);
            resetForm();
        } catch (err) {
            toast({
                title: "Failed to create category",
                description: "An error occurred while creating the category",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                </DialogHeader>{" "}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        className="w-full"
                        onClick={onSubmit}
                    >
                        {isSubmitting ? "Creating..." : "Create Category"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategory;
