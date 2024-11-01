import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./components/Home";
import "./index.css";
import Admin from "./components/Admin";
import Login from "./components/Login";
import Landing from "./components/LandingPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/", // Landing page route
                element: <Landing />,
            },
            {
                path: "/home",
                element: <Home />,
            },
            {
                path: "/login", // Login page route
                element: <Login />,
            },
        ],
    },
    {
        path: "/admin",
        element: <App />,
        children: [
            {
                path: "/admin",
                element: <Admin />,
            },
        ],
    },
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
        <RouterProvider router={router} />
    </React.StrictMode>
);
