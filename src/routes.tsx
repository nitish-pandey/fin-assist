import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./App";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OrgLayout from "./layouts/OrgLayout";
import Logout from "./pages/auth/logout";
import SettingLayout from "./layouts/SettingLayout";
import ProfilePage from "./pages/settings/Profile";
import UserOrgs from "./pages/settings/Orgs";

export const routes: RouteObject[] = [
    {
        element: <App />,
        children: [
            {
                path: "auth",
                element: <AuthLayout />,
                children: [
                    {
                        path: "login",
                        element: <Login />,
                    },
                    {
                        path: "register",
                        element: <Register />,
                    },
                    {
                        path: "logout",
                        element: <Logout />,
                    },
                ],
            },
            {
                path: "org/:orgId",
                element: <OrgLayout />,
                children: [
                    {
                        element: <h1>Dashboard</h1>,
                        path: "dashboard",
                    },
                    {
                        element: <h1>Settings</h1>,
                        path: "users",
                    },
                    {
                        element: <h1>Profile</h1>,
                        path: "products",
                    },
                ],
            },
            {
                path: "settings",
                element: <SettingLayout />,

                children: [
                    {
                        path: "profile",
                        element: <ProfilePage />,
                    },
                    {
                        path: "orgs",
                        element: <UserOrgs />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <h1>404 Not Found </h1>,
    },
];

export const router = createBrowserRouter(routes);
