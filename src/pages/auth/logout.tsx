import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "../../providers/Toast";
const Logout = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    useEffect(() => {
        document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
            "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.clear();
        sessionStorage.clear();
        showToast("Logged out successfully", "success", 2000);
        console.log("Logged out successfully");
        navigate("/auth/login");
    }, []);

    return null;
};

export default Logout;
