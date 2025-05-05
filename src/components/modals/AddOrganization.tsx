import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { useForm } from "react-hook-form";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddOrganizationFormData {
    name: string;
    description: string;
}

export function AddOrganizationForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, refetch } = useAuth();
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AddOrganizationFormData>();

    const onSubmit = async (data: AddOrganizationFormData) => {
        setLoading(true);
        try {
            const userId = user?.id || "";
            await api.post(`/users/${userId}/orgs`, data);

            toast({
                title: "Success",
                description: "Organization created successfully!",
            });

            await refetch(); // Fetch updated user data
            reset(); // Clear form fields
            setOpen(false); // Close modal
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create organization.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} className="w-full max-w-60" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Organization
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter organization name"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && (
                                <span className="text-red-500">{errors.name.message}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description", {
                                    required: "Description is required",
                                })}
                                placeholder="Enter organization description"
                            />
                            {errors.description && (
                                <span className="text-red-500">{errors.description.message}</span>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Organization"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
