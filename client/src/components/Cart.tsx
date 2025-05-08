import { useCart } from "../providers/CartProvider";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/apiRequest";
import { useAuth } from "../providers/AuthProvider";
import { useEffect, useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
} from "@chakra-ui/react";
function Cart() {
    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } =
        useCart();
    const navigate = useNavigate();
    const { user, dispatch } = useAuth();
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null!);

    const handleCheckout = async () => {
        const hasShipping = items.some(
            (item) => item.deliveryMethod === "shipping"
        );

        const order = {
            items: items.map((item) => ({
                product: {
                    title: item.title,
                    price: parseFloat(item.specification.price),
                },
                quantity: item.quantity,
                deliveryMethod:
                    item.deliveryMethod == "shipping"
                        ? "standard"
                        : "self-collection",
            })),
        };

        const fetchUserData = async () => {
            const response = await apiRequest("users", "GET", `${user?._id}`);
            if (response.success) {
                return response.data;
            }
        };

        // Fetch user data first
        const userData = await fetchUserData();

        console.log(hasShipping);
        console.log(userData.address);
        if (hasShipping && userData.address == "") {
            // redirect to profile page with a pop up that requires user to update address
            console.log("redirect");
            setShowRedirectModal(true);
            return;
        }

        // Then, send the data with the order request
        const response = await apiRequest(
            "order",
            "POST",
            "create-checkout-session",
            { order, userID: user?._id }
        );

        if (response.success) {
            window.open(response.data.url, "_blank");
        } else {
            console.error("Error creating checkout session:", response.message);
        }
    };

    useEffect(() => {
        const handlePaymentSuccess = (event: any) => {
            if (event.data.success) {
                // console.log("PAYMENT SUCCESS")
                // Clear the cart after successful payment
                clearCart();
            }
        };

        window.addEventListener("message", handlePaymentSuccess);

        return () => {
            window.removeEventListener("message", handlePaymentSuccess);
        };
    }, []);

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="mb-6">
                        <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h1 className="text-3xl font-bold mb-3 text-gray-800">
                            Your Cart is Empty
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Looks like you haven't added any items to your cart
                            yet
                        </p>
                    </div>
                    <Button
                        colorScheme="blue"
                        size="lg"
                        width="full"
                        onClick={() => navigate("/home")}
                        className="hover:bg-blue-600"
                    >
                        Start Shopping
                    </Button>
                    <Button
                        colorScheme="blue"
                        size="lg"
                        style={{ marginTop: "10px" }}
                        width="full"
                        onClick={() => navigate("/orderHistory")}
                    >
                        View Order History
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate("/orderHistory")}
                >
                    View Order History
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
                {items.map((item) => (
                    <div
                        key={`${item.listingId}-${item.specification.colour}-${item.specification.size}`}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <div className="flex gap-6">
                            {/* Item Image */}
                            <div className="w-32 h-32 flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>

                            {/* Item Details */}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {item.title}
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            Color: {item.specification.colour} |
                                            Size: {item.specification.size} |
                                            Price ($):{" "}
                                            {item.specification.price}
                                        </p>
                                        <p className="text-gray-600">
                                            Delivery:{" "}
                                            {item.deliveryMethod === "shipping"
                                                ? "Shipping"
                                                : "Self Collection"}
                                        </p>
                                    </div>
                                    <p className="text-xl font-semibold">
                                        $
                                        {(
                                            parseFloat(
                                                item.specification.price
                                            ) * item.quantity
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                {/* Quantity and Remove Controls */}
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">
                                            Quantity:
                                        </span>
                                        <select
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateQuantity(
                                                    item.listingId,
                                                    item.specification,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="border rounded-md px-2 py-1"
                                        >
                                            {[
                                                ...Array(
                                                    parseInt(
                                                        item.specification
                                                            .quantity
                                                    )
                                                ),
                                            ].map((_, i) => (
                                                <option
                                                    key={i + 1}
                                                    value={i + 1}
                                                >
                                                    {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() =>
                                            removeFromCart(
                                                item.listingId,
                                                item.specification
                                            )
                                        }
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        aria-label="Remove item"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md ml-auto">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between mb-4">
                            <span className="font-semibold">Total</span>
                            <span className="font-semibold">
                                ${getCartTotal().toFixed(2)}
                            </span>
                        </div>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            width="full"
                            onClick={handleCheckout} // Add checkout logic here
                        >
                            Proceed to Checkout
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            width="full"
                            mt={4}
                            onClick={() => navigate("/home")}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>

            {/* Address Validation Modal */}
            {showRedirectModal && (
                <AlertDialog
                    isOpen={showRedirectModal}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setShowRedirectModal(false)}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Shipping Address Required
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                You need to add a shipping address before
                                checking out with delivery items.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button
                                    ref={cancelRef}
                                    onClick={() => setShowRedirectModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    ml={3}
                                    onClick={() => {
                                        setShowRedirectModal(false);
                                        navigate("/profile", {
                                            state: { fromCheckout: true },
                                        });
                                    }}
                                >
                                    Go to Profile
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}
        </div>
    );
}

export default Cart;
