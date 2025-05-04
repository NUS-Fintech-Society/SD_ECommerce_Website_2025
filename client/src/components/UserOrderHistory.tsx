import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { apiRequest } from "../api/apiRequest";
import { Box, Heading, Text, Stack, Badge, Divider } from "@chakra-ui/react";

interface OrderItem {
    title: string;
    quantity: number;
    colour: string;
    size: string;
    images: string[];
    price: number;
    item_completed: boolean;
}

interface Order {
    _id: string;
    address: string;
    city: string;
    country: string;
    createdDate: string;
    deliveryMethod: string;
    deliveryStatus: string;
    items: OrderItem[];
    paymentStatus: string;
    totalAmount: number;
    userID: string;
    username: string;
    zipCode: string;
}

function UserOrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?._id) {
                const response = await apiRequest(
                    "order",
                    "GET",
                    `user/${user._id}`
                );
                if (response.success) {
                    setOrders(response.data.data);
                    console.log("Orders data:", response.data.data);
                }
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "green";
            case "pending":
                return "yellow";
            case "cancelled":
                return "red";
            default:
                return "gray";
        }
    };

    const getItemCompletedColor = (status: boolean) => {
        switch (status) {
            case true:
                return "green";
            case false:
                return "yellow";
            default:
                return "gray";
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <Box p={8} textAlign="center">
                <Heading size="md">No orders found</Heading>
                <Text mt={4}>You haven't placed any orders yet.</Text>
            </Box>
        );
    }

    return (
        <Box p={8}>
            <Heading mb={6}>Order History</Heading>
            <Stack spacing={6}>
                {orders.map((order) => (
                    <Box
                        key={order._id}
                        borderWidth="1px"
                        borderRadius="lg"
                        p={6}
                        shadow="sm"
                    >
                        <Stack spacing={4}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Text fontWeight="bold">
                                    Order #{order._id.slice(-6)}
                                </Text>
                                <Stack direction="row" spacing={2}>
                                    <Badge
                                        colorScheme={getStatusColor(
                                            order.deliveryStatus
                                        )}
                                    >
                                        {order.deliveryStatus.toUpperCase()}
                                    </Badge>
                                </Stack>
                            </Box>

                            <Text color="gray.600">
                                Placed on:{" "}
                                {new Date(
                                    order.createdDate
                                ).toLocaleDateString()}
                            </Text>

                            <Box>
                                <Text color="gray.600">Delivery Address:</Text>
                                <Text>{order.address}</Text>
                                <Text>{`${order.city}, ${order.country} ${order.zipCode}`}</Text>
                            </Box>

                            <Divider />

                            {order.items &&
                                order.items.map((item, index) => (
                                    <Box key={index}>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                        >
                                            <Text fontWeight="medium">
                                                {item.title}
                                            </Text>
                                            <Stack spacing={2}>
                                                <Badge
                                                    colorScheme={getItemCompletedColor(
                                                        item.item_completed
                                                    )}
                                                >
                                                    {item.item_completed
                                                        ? "Completed"
                                                        : "Pending"}
                                                </Badge>
                                            </Stack>
                                        </Box>
                                        <Text fontSize="sm" color="gray.600">
                                            Quantity: {item.quantity} | Color:{" "}
                                            {item.colour} | Size: {item.size}
                                        </Text>
                                    </Box>
                                ))}

                            <Divider />

                            <Box display="flex" justifyContent="space-between">
                                <Text>
                                    Delivery Method: {order.deliveryMethod}
                                </Text>
                                <Text fontWeight="bold">
                                    Total: ${order.totalAmount.toFixed(2)}
                                </Text>
                            </Box>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}

export default UserOrderHistory;
