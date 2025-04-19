import "./App.css";
import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

function App() {
    return (
        <main className="w-full">
            <Outlet />
            <Toaster />
        </main>
    );
}

export default App;
