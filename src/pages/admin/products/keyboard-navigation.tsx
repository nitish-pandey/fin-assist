"use client";
import { useEffect } from "react";

interface KeyboardNavigationProps {
    onNext: () => void;
    onPrev: () => void;
    enabled: boolean;
}

export function useKeyboardNavigation({ onNext, onPrev, enabled }: KeyboardNavigationProps) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore key events when user is typing in an input, textarea, or select
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement ||
                document.activeElement instanceof HTMLSelectElement
            ) {
                // Allow Enter key to proceed to next step when in the last input of a form
                if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    onNext();
                }
                return;
            }

            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault();
                    onNext();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    onPrev();
                    break;
                case "Enter":
                    if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                        e.preventDefault();
                        onNext();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onPrev();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onNext, onPrev, enabled]);
}
