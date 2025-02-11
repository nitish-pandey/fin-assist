import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./App";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Logout from "./pages/auth/logout";
import SettingLayout from "./layouts/SettingLayout";
import ProfilePage from "./pages/settings/Profile";
import UserOrgs from "./pages/settings/Orgs";
import OrgUsers from "./pages/admin/basic/OrgUsers";
import { MainLayout } from "./layouts/MainLayout";
import OrgInfoPage from "./pages/admin/basic/OrgInfo";
import OrgCategories from "./pages/admin/products/Categories";
import OrgProducts from "./pages/admin/products/Products";
import EntityInfo from "./pages/admin/basic/Entity";
import CreateAccountPage from "./pages/admin/accounts/CreateAccount";
import ViewAccountPage from "./pages/admin/accounts/ViewAccount";
import CreateProductPage from "./pages/admin/products/CreateProduct";
import OrderViewPage from "./pages/admin/order/view";
import CreateOrderPage from "./pages/admin/order/create";
import SingleOrderPage from "./pages/admin/order/SingleOrderPage";
import DashboardPage from "./pages/admin/basic/Dashboard";

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
                element: <MainLayout />,
                children: [
                    {
                        element: <DashboardPage />,
                        path: "dashboard",
                    },
                    {
                        element: <OrgUsers />,
                        path: "users",
                    },
                    {
                        element: <OrgInfoPage />,
                        path: "info",
                    },
                    {
                        path: "accounts",
                        children: [
                            {
                                element: <CreateAccountPage />,
                                path: "create",
                            },
                            {
                                element: <ViewAccountPage />,
                                path: "view",
                            },
                        ],
                    },
                    {
                        path: "categories",
                        element: <OrgCategories />,
                    },
                    {
                        path: "products",
                        children: [
                            {
                                element: <OrgProducts />,
                                path: "list",
                            },
                            {
                                element: <CreateProductPage />,
                                path: "create",
                            },
                        ],
                    },
                    {
                        path: "entity",
                        element: <EntityInfo />,
                    },
                    {
                        path: "orders",
                        children: [
                            {
                                element: <OrderViewPage />,
                                path: "view",
                            },
                            {
                                element: <CreateOrderPage />,
                                path: "create",
                            },
                            {
                                element: <SingleOrderPage />,
                                path: ":orderId",
                            },
                        ],
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
