"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BasicDetailsForm } from "./basic-details-form";
import { OptionsForm } from "./option-form";
import { VariantsForm } from "./variants-form";
import { SummaryView } from "./summary-view";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "./types";
import { generateVariants, generateDefaultSKU } from "./utils";
import { Category } from "@/data/types";
import { useOrg } from "@/providers/org-provider";
import { api } from "@/utils/api";

interface Step {
    id: number;
    title: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`flex-1 text-center ${
                            step.id === currentStep
                                ? "text-primary font-medium"
                                : step.id < currentStep
                                ? "text-primary/70"
                                : "text-muted-foreground"
                        }`}
                    >
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">{step.id}</span>
                    </div>
                ))}
            </div>

            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                    style={{
                        width: `${
                            ((currentStep - 1) / (steps.length - 1)) * 100
                        }%`,
                    }}
                />
                <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-[1px]">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`h-4 w-4 rounded-full border-2 border-background transition-all duration-200 ${
                                step.id <= currentStep
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ProductForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLDivElement>(null);

    const steps = [
        { id: 1, title: "Basic Details" },
        { id: 2, title: "Options" },
        { id: 3, title: "Variants" },
        { id: 4, title: "Summary" },
    ];
    const { orgId } = useOrg();

    const initialProduct: Product = {
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        code: "",
        stock: 0,
        sku: generateDefaultSKU(),
        options: [],
        variants: [],
    };
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await (
                    await api.get<Category[]>(`/orgs/${orgId}/category`)
                ).data;
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                toast({
                    title: "Error",
                    description: "Could not load categories.",
                    variant: "destructive",
                });
            }
        };
        fetchCategories();
    }, [orgId]);

    const addCategory = async (name: string, description: string) => {
        const newCategory = await api.post(`/orgs/${orgId}/category`, {
            name,
            description,
        });
        // set product.categoryId to the new category ID

        setCategories((prev) => [...prev, newCategory.data]);
        setProduct((prev) => ({
            ...prev,
            categoryId: newCategory.data.id,
        }));
    };
    const [product, setProduct] = useState<Product>(initialProduct);
    const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);

    // Auto-generate SKU when product name or category changes
    useEffect(() => {
        if (product.name && !isSkuManuallyEdited) {
            const generatedSKU = generateDefaultSKU();
            setProduct((prev) => ({
                ...prev,
                sku: generatedSKU,
            }));
        }
    }, [product.name, product.categoryId, categories, isSkuManuallyEdited]);

    // Generate variants whenever options change, with debounce
    useEffect(() => {
        if (product.options && product.options.length > 0) {
            const hasValidOptions = product.options.some(
                (option) =>
                    option.name && option.values && option.values.length > 0
            );

            if (hasValidOptions) {
                setIsGeneratingVariants(true);
                const timer = setTimeout(() => {
                    const generatedVariants = generateVariants(
                        product.sku,
                        product.name,
                        product.options || [],
                        product.price,
                        product.stock
                    );
                    setProduct((prev) => ({
                        ...prev,
                        variants: generatedVariants,
                    }));
                    setIsGeneratingVariants(false);
                }, 300);

                return () => clearTimeout(timer);
            }
        }
    }, [
        product.options,
        product.price,
        product.stock,
        product.name,
        product.sku,
    ]);
    const updateProduct = useCallback((data: Partial<Product>) => {
        // Check if SKU was manually edited
        if (data.sku !== undefined) {
            setIsSkuManuallyEdited(true);
        }

        setProduct((prev) => ({
            ...prev,
            ...data,
        }));
    }, []);

    const handleNext = useCallback(() => {
        if (step < 4) {
            setStep(step + 1);
            // Scroll to top of form
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            // Submit the form
            handleSubmit();
        }
    }, [step]);

    const handlePrev = useCallback(() => {
        if (step > 1) {
            setStep(step - 1);
            // Scroll to top of form
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [step]);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Simulate API call
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Product Details:", product);
            await api.post(`/orgs/${orgId}/products`, product); // Reset form and show toast
            setProduct(initialProduct);
            setIsSkuManuallyEdited(false);
            setStep(1);

            toast({
                title: "Product Created Successfully",
                description:
                    "Your product has been created and is now available.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "There was an error creating your product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-6 w-full" ref={formRef}>
            <h1 className="text-3xl font-bold mb-4">Create Product</h1>
            <StepIndicator steps={steps} currentStep={step} />

            <Card className="shadow-md border-t-4 border-t-primary mt-8">
                <CardContent className="p-0">
                    <div className="p-6">
                        {step === 1 && (
                            <BasicDetailsForm
                                product={product}
                                updateProduct={updateProduct}
                                onNext={handleNext}
                                categories={categories}
                                addCategory={addCategory}
                            />
                        )}

                        {step === 2 && (
                            <OptionsForm
                                options={product.options || []}
                                updateOptions={(options) =>
                                    updateProduct({ options })
                                }
                            />
                        )}

                        {step === 3 && (
                            <VariantsForm
                                variants={product.variants || []}
                                updateVariants={(variants) =>
                                    updateProduct({ variants })
                                }
                                isLoading={isGeneratingVariants}
                            />
                        )}

                        {step === 4 && <SummaryView product={product} />}
                    </div>

                    <div className="flex justify-between items-center p-6 bg-muted/30 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={step === 1 || isSubmitting}
                            className="transition-all duration-200 hover:bg-muted"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        {step !== 1 && (
                            <Button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="transition-all duration-200 min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {step === 4 ? "Creating..." : "Next..."}
                                    </>
                                ) : (
                                    <>
                                        {step === 4 ? "Create Product" : "Next"}
                                        {step !== 4 && (
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        )}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
