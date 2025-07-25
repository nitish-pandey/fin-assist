import { Organization } from "@/data/types";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface EditOrgModalProps {
    onSubmit?: (data: Partial<Organization>) => void;
    orgData?: Organization;
}

export default function EditOrgModal({ onSubmit, orgData }: EditOrgModalProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Partial<Organization>>({
        defaultValues: orgData,
    });

    // Reset form when orgData changes
    useEffect(() => {
        reset(orgData);
    }, [orgData, reset]);

    const onFormSubmit = async (data: Partial<Organization>) => {
        try {
            await onSubmit?.(data);
            toast({
                title: "Success",
                description: "Organization updated successfully!",
            });
            setIsOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update organization.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="border border-white"
            >
                Edit
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Organization Info</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleSubmit(onFormSubmit)}
                        className="space-y-4"
                    >
                        {[
                            { id: "name", label: "Name", required: true },
                            { id: "contact", label: "Contact", required: true },
                            { id: "pan", label: "PAN", required: true },
                            { id: "vat", label: "VAT", required: true },
                            { id: "domain", label: "Domain", required: false },
                        ].map(({ id, label, required }) => (
                            <div key={id} className="space-y-2">
                                <Label htmlFor={id}>{label}</Label>
                                <Input
                                    id={id}
                                    {...register(
                                        id as keyof Organization,
                                        required
                                            ? {
                                                  required: `${label} is required`,
                                              }
                                            : {}
                                    )}
                                />
                                {errors[id as keyof Organization] && (
                                    <p className="text-sm text-red-500">
                                        {
                                            errors[id as keyof Organization]
                                                ?.message
                                        }
                                    </p>
                                )}
                            </div>
                        ))}
                        <div className="space-y-2">
                            <Label htmlFor="vatStatus">VAT Status</Label>
                            <Select
                                onValueChange={(value) => {
                                    // Using setValue from react-hook-form to update the value
                                    // You'll need to destructure setValue from useForm
                                    setValue(
                                        "vatStatus" as keyof Organization,
                                        value
                                    );
                                }}
                                defaultValue={
                                    orgData?.vatStatus || "conditional"
                                }
                            >
                                <SelectTrigger id="vatStatus">
                                    <SelectValue placeholder="Select VAT status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="conditional">
                                        Conditional
                                    </SelectItem>
                                    <SelectItem value="always">
                                        Always
                                    </SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.vatStatus && (
                                <p className="text-sm text-red-500">
                                    {errors.vatStatus.message}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
