import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { ACCESS } from "@/data/types";

interface AddPermissionProps {
    allowedPermissions: ACCESS[];
    onAdd: (permission: ACCESS) => void;
}

const AddPermission: React.FC<AddPermissionProps> = ({ allowedPermissions, onAdd }) => {
    const [selectedPermission, setSelectedPermission] = useState<ACCESS | null>(null);

    const handleAddPermission = () => {
        if (selectedPermission) {
            onAdd(selectedPermission);
            setSelectedPermission(null);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Permission</Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogContent className="w-full max-w-md p-6">
                    <DialogTitle className="text-xl font-bold mb-2">Add Permission</DialogTitle>
                    <DialogDescription className="mb-4 text-gray-600">
                        Select a permission to add from the list below.
                    </DialogDescription>
                    {allowedPermissions.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {allowedPermissions.map((permission) => (
                                <Button
                                    key={permission}
                                    onClick={() => setSelectedPermission(permission)}
                                    className={`${
                                        selectedPermission === permission
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {permission}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No permissions available.</p>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                        <DialogClose asChild>
                            <Button variant="outline" onClick={() => setSelectedPermission(null)}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={handleAddPermission} disabled={!selectedPermission}>
                            Add
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};

export default AddPermission;
