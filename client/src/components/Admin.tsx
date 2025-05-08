import React from "react";
// import CreateListing from "./CreateListing";
import CreateListing from "./Create_Edit_Listing";
import { useAuth } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";

const Admin = () => {
    var { user } = useAuth(); // Get the user from AuthProvider
    if (!user?.isAdmin) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <CreateListing />
        </div>
    );
};

export default Admin;
