import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { GlobalProvider } from "./providers/ConfigProvider";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <GlobalProvider>
            <RouterProvider router={router} />
        </GlobalProvider>
    </StrictMode>
);
