import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    variant?: "login" | "register";
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, variant = "login" }) => {
    const { googleLogin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const login = async (credential: string) => {
        try {
            await googleLogin(credential);

            toast({
                title: `${variant === "login" ? "Login" : "Registration"} successful`,
                description: `You have successfully ${
                    variant === "login" ? "logged in" : "registered"
                } with Google.`,
            });

            onSuccess?.();
            navigate("/profile");
        } catch (error: any) {
            console.error("Google Login Error:", error);
            const errorMessage =
                error.response?.data?.message || `Google ${variant} failed. Please try again.`;

            toast({
                title: `Google ${variant} failed`,
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return (
        <GoogleLogin
            onSuccess={(credential) => {
                if (credential && credential.credential) login(credential.credential);
            }}
            onError={() => {
                console.error("Google OAuth Error: Login failed");
                toast({
                    title: `Google ${variant} failed`,
                    description: "Failed to authenticate with Google. Please try again.",
                    variant: "destructive",
                });
            }}
            width="100%"
            useOneTap
        />
    );
};

export default GoogleLoginButton;
