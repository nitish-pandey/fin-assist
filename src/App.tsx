import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Outlet } from "react-router-dom";
import { useGlobalContext } from "./providers/ConfigProvider";
import { useEffect, useState } from "react";

function App() {
    const { updateProfile } = useGlobalContext();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        updateProfile();
        setLoading(false);
    }, [updateProfile]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Outlet />
            <ToastContainer />
        </>
    );
}

export default App;
