import React, { useEffect } from "react";
import { apiRequest } from "../api/apiRequest";
import Navbar from "./Navbar"

const Home = () => {
    useEffect(() => {
        console.log("Testing API Endpoint");
        // Test the GET all users endpoint
        const fetchAllUsers = async () => {
            try {
                const response = await apiRequest("users", "GET", "");
                if (response.success) {
                    console.log("Fetched users:", response.data);
                } else {
                    console.error("Error fetching users:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test the GET user by ID endpoint
        const fetchUserById = async (userId: string) => {
            try {
                const response = await apiRequest("users", "GET", userId);
                if (response.success) {
                    console.log(
                        `Fetched user with ID ${userId}:`,
                        response.data
                    );
                } else {
                    console.error(
                        `Error fetching user with ID ${userId}:`,
                        response.message
                    );
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test the POST register endpoint
        const registerUser = async () => {
            try {
                const response = await apiRequest("users", "POST", "register", {
                    username: "newuser5",
                    email: "newuser5@example.com",
                    password: "password123",
                    isAdmin: false,
                    isSuperAdmin: false,
                });
                if (response.success) {
                    console.log("User registered successfully:", response.data);
                } else {
                    console.error("Error registering user:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test the stripe API endpoint
        const checkoutCart = async () => {
            try {
                console.log("Testing checkout API");
                const response = await apiRequest(
                    "order",
                    "POST",
                    "create-checkout-session",
                    {
                        order: {
                            items: [
                                {
                                    product: { title: "Product 1", price: 10 },
                                    quantity: 2,
                                },
                                {
                                    product: { title: "Product 2", price: 5 },
                                    quantity: 1,
                                },
                            ],
                        },
                    }
                );
                if (response.success) {
                    window.open(
                        response.data.url,
                        "_blank",
                        "width=600,height=800"
                    );
                    console.log("Checkout successful: ", response);
                } else {
                    console.error("Error checking out: ", response);
                }
            } catch (error) {
                console.log("Error:", error);
            }
        };

        // Call the test functions
        console.log("Testing API Endpoints:");
        //registerUser();
        //fetchAllUsers();
        //fetchUserById("60d21b4667d0d8992e610c85"); // Replace with a valid user ID
        //checkoutCart();
    }, []);
    return <div>Welcome to ELEOS Home Page</div>;
};

export default Home;