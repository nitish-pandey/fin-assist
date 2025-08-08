import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Entity } from "@/data/types";

interface AddEntityProps {
    text?: string;
    entity?: Entity;
    addEntity: (entity: Partial<Entity>) => Promise<void>;
    type?: "merchant" | "vendor" | "both";
}

const AddEntity: React.FC<AddEntityProps> = ({
    addEntity,
    text,
    entity,
    type,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: entity?.name || "",
        phone: entity?.phone || "",
        email: entity?.email || "",
        description: entity?.description || "",
        isMerchant:
            entity?.isMerchant || type === "merchant" || type === "both",
        isVendor: entity?.isVendor || type === "vendor" || type === "both",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        phone?: string;
        email?: string;
    }>({});
    const { toast } = useToast(); // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone);
    };

    const validateForm = (): boolean => {
        const errors: { name?: string; phone?: string; email?: string } = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters long";
        }

        // Phone validation
        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!validatePhone(formData.phone)) {
            errors.phone = "Please enter a valid phone number";
        } // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear validation error for the field being edited
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await addEntity(formData);
            toast({
                description: "Entity added successfully",
            });
            setFormData({
                name: "",
                phone: "",
                email: "",
                description: "",
                isMerchant: false,
                isVendor: false,
            });
            setValidationErrors({});
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            setError("Failed to add entity. Please try again.");
            toast({
                description: "Failed to add entity. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Button
                type="button"
                onClick={() => {
                    setIsOpen(true);
                    setValidationErrors({});
                    setError(null);
                }}
            >
                {text || "Add Entity/Party"}
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {entity ? "Edit Entity" : "Add New Entity"}
                        </DialogTitle>
                        <DialogDescription>
                            {/* Fill in the details to add a new entity to your organization. */}
                            {entity
                                ? "Update the entity details"
                                : "Fill in the details to add a new entity to your organization."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {" "}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Entity name"
                                    className={
                                        validationErrors.name
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {validationErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className={
                                        validationErrors.phone
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {validationErrors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.phone}
                                    </p>
                                )}
                            </div>{" "}
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    className={
                                        validationErrors.email
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {validationErrors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Entity description"
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                        </div>
                        <div className="flex items-center mt-4">
                            <Label className="mr-4">Entity Type:</Label>
                            <div className="flex items-center mr-6">
                                <Input
                                    type="checkbox"
                                    id="isMerchant"
                                    name="isMerchant"
                                    checked={formData.isMerchant || false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isMerchant: e.target.checked,
                                        }))
                                    }
                                />
                                <Label htmlFor="isMerchant" className="ml-2">
                                    Merchant
                                </Label>
                            </div>
                            <div className="flex items-center">
                                <Input
                                    type="checkbox"
                                    id="isVendor"
                                    name="isVendor"
                                    checked={formData.isVendor || false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isVendor: e.target.checked,
                                        }))
                                    }
                                />
                                <Label htmlFor="isVendor" className="ml-2">
                                    Vendor
                                </Label>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddEntity;
