import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <main className="dark text-white">
            <Outlet />
            <ToastContainer />
        </main>
    );
}

export default App;
