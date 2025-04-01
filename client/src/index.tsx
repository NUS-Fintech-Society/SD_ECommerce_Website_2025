import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import App from "./App";
import Admin from "./components/Admin";
import Home from "./components/Home";
import Landing from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import "./index.css";
import EditProfile from "./components/EditProfile";
import { ChakraProvider } from "@chakra-ui/react";
import AdminRequest from "./components/AdminRequestForm";
import ManageAccounts from "./components/ManageAccounts";
import AdminRequests from "./components/AdminRequests";
import Cart from "./components/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./providers/AuthProvider";
import NotFound from "./components/NotFound";
import LandingPage from "./components/LandingPage";
import AdminOrdersTracking from "./components/AdminOrdersTracking";

// Component that checks if user is authenticated
const AuthRedirect = () => {
    const { user } = useAuth(); // Get the user from your useAuth hook
    if (user) {
        // If user is logged in, redirect to /home
        return <Navigate to="/home" />;
    }
    // If not authenticated, show LandingPage
    return <LandingPage />;
};

// Component for Login page redirect if already logged in
const LoginRedirect = () => {
    const { user } = useAuth(); // Get the user from your useAuth hook
    if (user) {
        // If user is logged in, redirect to /home
        return <Navigate to="/home" />;
    }
    // Otherwise, render the Login page
    return <Login />;
};

// Component for Signup page redirect if already logged in
const SignupRedirect = () => {
    const { user } = useAuth(); // Get the user from your useAuth hook
    if (user) {
        // If user is logged in, redirect to /home
        return <Navigate to="/home" />;
    }
    // Otherwise, render the Signup page
    return <Signup />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/", // Landing page route
                element: <AuthRedirect />,
            },
            {
                path: "/home",
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/login", // Login page route
                element: <LoginRedirect />,
            },
            {
                path: "/signup", // Login page route
                element: <SignupRedirect />,
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/cart",
                element: (
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/profile/edit",
                element: (
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/profile/adminRequest",
                element: (
                    <ProtectedRoute>
                        <AdminRequest />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: "/admin",
        element: <App />,
        children: [
            {
                path: "/admin",
                element: (
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute>
                ),
            }, 
            {               
                path: "/admin/ordersTracking",
                element: (
                    <ProtectedRoute>
                        <AdminOrdersTracking />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: "/superAdmin",
        element: <App />,
        children: [
            {
                path: "/superAdmin",
                element: (
                    <ProtectedRoute>
                        <ManageAccounts />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/superAdmin/manageAccounts",
                element: (
                    <ProtectedRoute>
                        <ManageAccounts />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/superAdmin/adminRequests",
                element: (
                    <ProtectedRoute>
                        <AdminRequests />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    { path: "*", element: <NotFound />, handle: { isNotFound: true } },
    //Example on creating new path
    // {
    //     path: "/{new_path}",
    //     element: <App />,
    //     children: [
    //         {
    //             path: "/{new_path}",
    //             element: {file_name},
    //         },
    //     ],
    // },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider>
            <RouterProvider router={router} />
        </ChakraProvider>
    </React.StrictMode>
);
