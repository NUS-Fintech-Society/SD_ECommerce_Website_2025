import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/apiRequest";
import { useDisclosure } from "@chakra-ui/react";

export type Order = {
    userID: string;
    firstName: string;
    lastName: string;
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
    trackingNumber?: string; //optional as it may not exist for self collection
    estimatedDeliveryDate?: Date;
    items: {
        product: string; // Refers to Product ID (ObjectId in MongoDB)
        quantity: number;
        item_completed: false; // default state is false because not marked as completed by admin yet ; individual order item completion status 
    }[];
    createdDate: Date;
    paymentStatus: "pending" | "completed" | "failed";
    totalAmount: number;
};

function AdminOrdersTracking () {
    const [orders, setOrders] = useState<Order[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(
        null
    );
    const { isOpen, onOpen, onClose } = useDisclosure();


    const fetchOrders = async () => {
        try {
            const response = await apiRequest("order", "GET", "");
            if (response.success) {
                setOrders(response.data);
            } else {
                setErrorMessage(
                    response.message || "Failed to fetch orders."
                );
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
            <h2 className="text-xl font-bold">Current Orders</h2>
            {orders.filter(order => !order.items.every(item => item.item_completed)).length === 0 ? (
                <p>No current orders.</p>
            ) : (
                orders.filter(order => !order.items.every(item => item.item_completed)).map((order, index) => {
                    const completedItems = order.items.filter(item => item.item_completed).length;
                    const totalItems = order.items.length;
                    return (
                        <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img
                                        // src={order.items[0].images}
                                        alt="Item Image"
                                        className="w-16 h-16 rounded"
                                    />
                                    <div className="ml-4">
                                        <p className="font-semibold">Customer: {order.firstName} {order.lastName}</p>
                                        <p>Item: {} </p> //TODO: Update Item Title 
                                        <p>
                                            Quantity: {order.items[0].quantity} | Price: ${order.totalAmount}
                                        </p>
                                        <p>Delivery: {order.deliveryMethod.replace("-", " ")}</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded text-white ${
                                        completedItems === totalItems ? "bg-blue-700" : "bg-blue-300"
                                    }`}
                                >
                                    {completedItems === totalItems ? "Status: Completed!" : `Status: ${completedItems}/${totalItems} Completed`}
                                </span>
                            </div>
                            <div className="mt-2">
                                <button
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        onOpen();
                                    }}
                                    className="text-blue-500 underline"
                                >
                                    View More / Edit ▼
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
    
            <h2 className="text-xl font-bold mt-6">Completed Orders</h2>
            {orders.filter(order => order.items.every(item => item.item_completed)).length === 0 ? (
                <p>No completed orders.</p>
            ) : (
                orders.filter(order => order.items.every(item => item.item_completed)).map((order, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <img
                                    src={`/images/${order.items[0]?.product}.jpg`}
                                    alt="Item Image"
                                    className="w-16 h-16 rounded"
                                />
                                <div className="ml-4">
                                    <p className="font-semibold">Customer: {order.firstName} {order.lastName}</p>
                                    <p>Item: {order.items[0]?.product}</p>
                                    <p>
                                        Quantity: {order.items[0]?.quantity} | Price: ${order.totalAmount}
                                    </p>
                                    <p>Delivery: {order.deliveryMethod.replace("-", " ")}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded bg-blue-700 text-white">Status: Completed!</span>
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={() => {
                                    setSelectedOrder(order);
                                    onOpen();
                                }}
                                className="text-blue-500 underline"
                            >
                                View More / Edit ▼
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminOrdersTracking;
