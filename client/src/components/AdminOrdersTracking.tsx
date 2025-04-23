import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/apiRequest";
import OrderCard from "./OrderCard"; // Import the reusable OrderCard component
// import { ObjectWithId } from "auth0";

export type Order = {
    _id: string;
    userID: string;
    username: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    deliveryMethod: "standard" | "express" | "self-collection";
    deliveryStatus:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "ready-for-collection"
        | "collected";
    trackingNumber?: string; // Optional as it may not exist for self collection
    items: Array<{
        item_completed: boolean;
        title: string;
        colour: string;
        size: string;
        images: string[];
        quantity: number;
        price: number;
    }>;
    createdDate: Date;
    paymentStatus: "pending" | "completed" | "failed";
    totalAmount: number;
};

function AdminOrdersTracking() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await apiRequest("order", "GET", "");
            if (response.success) {
                setOrders(response.data);
            } else {
                setErrorMessage(response.message || "Failed to fetch orders.");
            }
        } catch (error) {
            setErrorMessage("An error occurred while fetching orders.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="p-4">
            {/* Current Orders Section */}
            <h2 className="text-xl font-bold">Current Orders</h2>
            {orders.filter(
                (order) => !order.items.every((item) => item.item_completed)
            ).length === 0 ? (
                <p>No current orders.</p>
            ) : (
                orders
                    .filter(
                        (order) =>
                            !order.items.every((item) => item.item_completed)
                    )
                    .map((order, index) => (
                        <OrderCard key={index} order={order} />
                    ))
            )}

            {/* Completed Orders Section */}
            <h2 className="text-xl font-bold mt-6">Completed Orders</h2>
            {orders.filter((order) =>
                order.items.every((item) => item.item_completed)
            ).length === 0 ? (
                <p>No completed orders.</p>
            ) : (
                orders
                    .filter((order) =>
                        order.items.every((item) => item.item_completed)
                    )
                    .map((order, index) => (
                        <OrderCard key={index} order={order} />
                    ))
            )}
        </div>
    );
}

export default AdminOrdersTracking;
