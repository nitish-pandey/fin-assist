import ProductForm from "./create-product";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const CreateProductModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    Create Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-4xl mx-auto">
                <DialogTitle>Create New Product</DialogTitle>
                <ProductForm />
            </DialogContent>
        </Dialog>
    );
};

export default CreateProductModal;
