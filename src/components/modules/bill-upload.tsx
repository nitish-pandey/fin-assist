import type React from "react";
import { useState, useCallback } from "react";
import { Trash2, Upload, File, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BillUploadProps {
    files: File[];
    onRemove: (index: number) => void;
    onUpload: (files: File[]) => void;
    error?: string;
    maxFiles?: number;
    maxSize?: number; // in MB
}

const BillUpload: React.FC<BillUploadProps> = ({
    files,
    onRemove,
    onUpload,
    error,
    maxFiles = 10,
    maxSize = 10, // 10MB default
}) => {
    const [isDragging, setIsDragging] = useState(false);

    // Get file icon based on type
    const getFileIcon = (file: File) => {
        const type = file.type;
        if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
        if (type.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        return <File className="h-5 w-5 text-gray-500" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            // Filter out files that exceed max size
            const validFiles = newFiles.filter((file) => file.size <= maxSize * 1024 * 1024);

            // Check if adding these files would exceed maxFiles
            const totalFiles = files.length + validFiles.length;
            const filesToAdd =
                totalFiles > maxFiles ? validFiles.slice(0, maxFiles - files.length) : validFiles;

            if (filesToAdd.length > 0) {
                onUpload([...files, ...filesToAdd]);
            }

            // Reset input value to allow selecting the same file again
            e.target.value = "";
        }
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files) {
                const newFiles = Array.from(e.dataTransfer.files);

                // Filter out files that exceed max size
                const validFiles = newFiles.filter((file) => file.size <= maxSize * 1024 * 1024);

                // Check if adding these files would exceed maxFiles
                const totalFiles = files.length + validFiles.length;
                const filesToAdd =
                    totalFiles > maxFiles
                        ? validFiles.slice(0, maxFiles - files.length)
                        : validFiles;

                if (filesToAdd.length > 0) {
                    onUpload([...files, ...filesToAdd]);
                }
            }
        },
        [files, maxFiles, maxSize, onUpload]
    );

    return (
        <div className="space-y-4 py-6">
            <div className="flex items-center justify-between">
                <Label htmlFor="bill-upload" className="text-xl font-medium">
                    Bill Files
                </Label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {files.length}/{maxFiles} files
                    </span>
                    <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        id="bill-upload"
                        aria-label="Upload bill files"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => document.getElementById("bill-upload")?.click()}
                        disabled={files.length >= maxFiles}
                    >
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
                    files.length === 0 ? "h-40" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground font-medium">
                            Drag and drop files here or{" "}
                            <label
                                htmlFor="bill-upload"
                                className="text-primary cursor-pointer hover:underline"
                            >
                                browse
                            </label>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Supports PDF, PNG, JPG, JPEG (Max {maxSize}MB per file)
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between bg-background border rounded-md p-3 group hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {getFileIcon(file)}
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(index)}
                                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p className="text-destructive text-sm flex items-center gap-1 mt-1">{error}</p>
            )}

            {files.length >= maxFiles && (
                <p className="text-amber-500 text-sm mt-1">
                    Maximum number of files reached ({maxFiles}).
                </p>
            )}
        </div>
    );
};

export default BillUpload;
