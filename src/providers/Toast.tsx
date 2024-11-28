import { toast, ToastOptions } from "react-toastify";

// Define available toast types
type ToastType = "success" | "info" | "warning" | "error";

// Define the `showToast` function's signature
interface ShowToast {
    (message: string, type?: ToastType, duration?: number): void;
}

const useToast = (): { showToast: ShowToast } => {
    const showToast: ShowToast = (
        message,
        type = "info",
        duration = 5000 // Default duration: 5 seconds
    ) => {
        const options: ToastOptions = {
            position: "bottom-right",
            autoClose: duration,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        };

        // Trigger the appropriate toast
        switch (type) {
            case "success":
                toast.success(message, options);
                break;
            case "info":
                toast.info(message, options);
                break;
            case "warning":
                toast.warning(message, options);
                break;
            case "error":
                toast.error(message, options);
                break;
            default:
                toast.success(message, options);
                break;
        }
    };

    return { showToast };
};

export default useToast;
