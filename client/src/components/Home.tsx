import React, { useEffect } from "react";
import { apiRequest } from "../api/apiRequest";
import HomeListings from "./HomeListings";

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

        // Test the DELETE user endpoint
        const deleteUserById = async (userId: string) => {
            try {
                const response = await apiRequest("users", "DELETE", userId);
                if (response.success) {
                    console.log(`User with ID ${userId} deleted successfully.`);
                } else {
                    console.error(
                        `Error deleting user with ID ${userId}:`,
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

        //Test email sent to user
        const sendEmail = async (emailAddr: string) => {
            try {
                const response = await apiRequest("email", "POST", "send", {
                    to: emailAddr,
                    subject: "Test",
                    text: "This is a test",
                });
                if (response.success) {
                    console.log("Email sent to: ", emailAddr);
                } else {
                    console.log("Error when sending email: ", response.message);
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        };

        // Test order tracking
        const testTrackOrder = async (orderId: string) => {
            try {
                const response = await apiRequest(
                    "order",
                    "GET",
                    `track/${orderId}`
                );
                if (response.success) {
                    console.log("Order tracking info:", response.data);
                } else {
                    console.error("Error tracking order:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test checkout with delivery method
        const testCheckoutWithDelivery = async () => {
            try {
                const response = await apiRequest(
                    "order",
                    "POST",
                    "create-checkout-session",
                    {
                        userID: "6724e127710ad07070a6cfba",
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
                        deliveryMethod: "standard",
                    }
                );
                if (response.success) {
                    window.open(
                        response.data.url,
                        "_blank",
                        "width=600,height=800"
                    );
                    console.log("Checkout with delivery successful:", response);
                } else {
                    console.error("Error checking out:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Create order and test delivery selection
        const testOrderAndDelivery = async (productId: string) => {
            try {
                // Calculate total amount
                const items = [
                    {
                        product: productId,
                        quantity: 2,
                    },
                ];
                const totalAmount = items.reduce(
                    (total, item) => total + item.quantity * 10,
                    0
                ); // Assuming price is 10 for simplicity

                // First create an order
                const orderResponse = await apiRequest(
                    "order",
                    "POST",
                    "create",
                    {
                        userID: "6724e127710ad07070a6cfba",
                        firstName: "Test",
                        lastName: "User",
                        address: "123 Test St",
                        city: "Test City",
                        country: "Test Country",
                        zipCode: "12345",
                        items: items.map((item) => ({
                            product: item.product, // Pass product ID directly
                            quantity: item.quantity,
                        })),
                        totalAmount: totalAmount,
                        deliveryMethod: "standard", // Add delivery method
                    }
                );

                if (orderResponse.success) {
                    const orderId = orderResponse.data.order._id;
                    console.log("Order created:", orderId); // Log the orderId

                    // Now test delivery selection with the new order ID
                    const deliveryResponse = await apiRequest(
                        "order",
                        "POST",
                        "select-delivery",
                        {
                            orderId: orderId,
                            deliveryMethod: "standard",
                        }
                    );

                    if (deliveryResponse.success) {
                        console.log(
                            "Delivery method selected:",
                            deliveryResponse.data
                        );

                        // Test tracking the order
                        await testTrackOrder(orderId);
                    }
                }
            } catch (error) {
                console.error("Error in order and delivery test:", error);
            }
        };

        // Test get all products
        const fetchAllProducts = async () => {
            try {
                const response = await apiRequest("product", "GET", "");
                if (response.success) {
                    console.log("Available products:", response.data);
                    // Use the first product's ID for testing
                    if (response.data && response.data.length > 0) {
                        const productId = response.data[0]._id;
                        console.log("Using product ID:", productId);
                        // Now test order creation with this product ID
                        testOrderAndDelivery(productId);
                    }
                } else {
                    console.error("Error fetching products:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test create product
        const createTestProduct = async () => {
            try {
                const response = await apiRequest("product", "POST", "create", {
                    title: "Test Product",
                    description: "A test product for order testing",
                    price: 29.99,
                    category: "Test",
                    imageUrl: "https://example.com/test-image.jpg",
                    stockQuantity: 100,
                    collectionInfo: {
                        name: "Test Collection",
                        description: "Test collection for product",
                    },
                    deliveryMethods: {
                        shipping: {
                            available: true,
                            cost: 5.99,
                        },
                        selfCollection: {
                            available: true,
                            location: "Test Store Location",
                        },
                    },
                });

                if (response.success) {
                    console.log("Product created:", response.data);
                    await fetchAllProducts();
                } else {
                    console.error("Error creating product:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Call the test function
        console.log("Testing API Endpoints:");
        // createTestProduct(); // Call this first
        // fetchAllProducts();
        // testOrderAndDelivery("67d5a64f4cd1dcb0d66abf1d");
        // testCheckoutWithDelivery();
        //registerUser();
        // fetchAllUsers();
        //fetchUserById("60d21b4667d0d8992e610c85"); // Replace with a valid user ID
        // checkoutCart();
        // sendEmail("vijay75011@gmail.com"); //Replace with user email address
    }, []);

    return (
        <>
            <h1 className="p-2 text-2xl font-bold text-center my-4">
                Welcome to ELEOS Home Page
            </h1>
            <HomeListings />
        </>
    );
};

export default Home;
