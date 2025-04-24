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
}

const AddEntity: React.FC<AddEntityProps> = ({ addEntity, text, entity }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: entity?.name || "",
        phone: entity?.phone || "",
        email: entity?.email || "",
        description: entity?.description || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await addEntity(formData);
            toast({
                description: "Entity added successfully",
            });
            setFormData({ name: "", phone: "", email: "", description: "" });
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
            <Button type="button" onClick={() => setIsOpen(true)}>
                {text || "Add Entity"}
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{entity ? "Edit Entity" : "Add New Entity"}</DialogTitle>
                        <DialogDescription>
                            {/* Fill in the details to add a new entity to your organization. */}
                            {entity
                                ? "Update the entity details"
                                : "Fill in the details to add a new entity to your organization."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Entity name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                />
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
                            {error && <p className="text-red-500 text-sm">{error}</p>}
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
