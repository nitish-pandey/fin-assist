import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Outlet } from "react-router-dom";
import { useGlobalContext } from "./providers/ConfigProvider";
import { useEffect } from "react";

function App() {
    const { updateProfile } = useGlobalContext();
    useEffect(() => {
        updateProfile();
    }, [updateProfile]);

    return (
        <>
            <Outlet />
            <ToastContainer />
        </>
    );
}

export default App;
