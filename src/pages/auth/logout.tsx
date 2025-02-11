import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
const Logout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    useEffect(() => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.clear();
        sessionStorage.clear();
        toast({
            title: "Logged out",
            description: "You are now logged out.",
        });
        console.log("Logged out successfully");
        navigate("/auth/login");
    }, []);

    return null;
};

export default Logout;
