const express = require("express");
const mongoose = require("mongoose");
const { Order } = require("../models/orders");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../../src/models/products");
const { Listing } = require("../models/listings");
const { User } = require("../models/user");

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { order, deliveryMethod, userID } = req.body.data;
        console.log("Received order data:", order, deliveryMethod, userID);

        // Map and validate order items with proper price and item_completed fields
        const orderItems = await Promise.all(
            order.items.map(async (item) => {
                try {
                    const product = await Listing.findOne({
                        title: item.product.title,
                    });

                    if (!product) {
                        throw new Error(
                            `Product with title ${item.product.title} not found.`
                        );
                    }

                    // Ensure price is a valid number
                    const price = parseFloat(product.specifications[0].price);
                    if (isNaN(price)) {
                        throw new Error(
                            `Invalid price for product ${item.product.title}`
                        );
                    }

                    return {
                        title: product.title,
                        colour: product.specifications[0].colour,
                        size: product.specifications[0].size,
                        images: product.images,
                        price: price,
                        quantity: item.quantity,
                        item_completed: false, // Explicitly set default value
                    };
                } catch (err) {
                    console.error(`Error fetching product: ${err.message}`);
                    throw err;
                }
            })
        );

        console.log("Processed order items:", orderItems);

        // Calculate delivery fee
        let deliveryFee = 0;
        switch (deliveryMethod) {
            case "express":
                deliveryFee = 15.0;
                break;
            case "standard":
                deliveryFee = 5.0;
                break;
            case "self-collection":
                deliveryFee = 0.0;
                break;
            default:
                deliveryFee = 0.0;
        }

        // Fix the total amount calculation - only add delivery fee once
        const subtotal = orderItems.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0);

        const totalAmount = subtotal + deliveryFee;

        // Ensure total amount is a valid number
        const finalTotalAmount = isNaN(totalAmount) ? 0 : totalAmount;

        const user = await User.findById(userID);
        if (!user) {
            throw new Error(`User with ID ${userID} not found`);
        }

        console.log("User found:", user.username);

        // Create the order with explicit fields
        const newOrder = new Order({
            userID: user._id,
            username: user.username,
            address: user.address || "Address",
            city: user.city || "City",
            country: user.country || "Country",
            zipCode: user.zipCode || "Zip Code",
            items: orderItems, // Our properly formatted items with price and item_completed
            createdDate: new Date(),
            deliveryMethod: deliveryMethod,
            totalAmount: finalTotalAmount,
            paymentStatus: "pending",
        });

        // Set up Stripe session
        const baseUrl =
            process.env.NODE_ENV === "production"
                ? "https://sd-ecommerce-2025-server.vercel.app"
                : `http://localhost:${process.env.PORT}`;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            // client_reference_id: JSON.stringify({
            //     orderID: newOrder._id, // Save order ID for webhook to update payment status
            //     userID,
            //     deliveryMethod,
            //     deliveryFee,
            // }),
            client_reference_id: newOrder._id.toString(),
            payment_method_types: ["card", "paynow", "grabpay"],
            line_items: [
                ...order.items.map((item) => ({
                    price_data: {
                        currency: "sgd",
                        product_data: {
                            name: item.product.title,
                        },
                        unit_amount: Math.round(item.product.price * 100), // Ensure integer
                    },
                    quantity: item.quantity,
                })),
                {
                    price_data: {
                        currency: "sgd",
                        product_data: {
                            name: `${deliveryMethod.charAt(0).toUpperCase() +
                                deliveryMethod.slice(1)} Delivery`,
                        },
                        unit_amount: Math.round(deliveryFee * 100), // Ensure integer
                    },
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/order/success`,
            cancel_url: `${baseUrl}/order/cancel`,
        });

        try {
            // Save order to database with detailed error logging
            await newOrder.save();
            console.log("Order saved successfully:", newOrder._id);
        } catch (saveErr) {
            console.error("Order save error:", saveErr);
            if (saveErr.errors) {
                // Log specific validation errors
                Object.keys(saveErr.errors).forEach((field) => {
                    console.error(
                        `Field ${field} error:`,
                        saveErr.errors[field].message
                    );
                });
            }
            throw saveErr;
        }

        // Send the success response
        res.status(200).send({
            message: "Checkout session created",
            url: session.url,
            orderId: newOrder._id,
        });
    } catch (err) {
        console.error("Error in checkout session:", err);

        // Check if headers have already been sent
        if (!res.headersSent) {
            res.status(500).send({
                message: "Error creating order",
                error: err.message,
            });
        } else {
            console.log("Response already sent");
        }
    }
});

// Handle successful payment webhook
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;
        console.log("Webhook received");

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
            console.log("Webhook event type:", event.type);
        } catch (err) {
            console.error(
                "Webhook signature verification failed:",
                err.message
            );
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            try {
                const clientRef = JSON.parse(session.client_reference_id);
                const { orderID } = clientRef;

                console.log("Updating payment status for order:", orderID);

                // Update existing order instead of creating a new one
                const existingOrder = await Order.findById(orderID);
                if (!existingOrder) {
                    console.error("Order not found in webhook:", orderID);
                    return res
                        .status(404)
                        .json({ received: true, error: "Order not found" });
                }

                // Update payment status
                existingOrder.paymentStatus = "completed";
                await existingOrder.save();
                console.log("Order payment status updated to completed");
            } catch (err) {
                console.error(
                    "Error updating order payment status:",
                    err.message
                );
                return res
                    .status(500)
                    .json({ received: true, error: err.message });
            }
        }

        res.json({ received: true });
    }
);

// Tester routes for success and cancel
router.get("/success", (req, res) => {
    res.send(`
    <script>
      window.opener.postMessage({ success: true }, "*");
      window.close();
    </script>
    <p>Payment successful! If this page does not close automatically, please close it manually.</p>
  `);
});

router.get("/cancel", (req, res) => {
    res.send("Payment canceled. Please try again.");
});

router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userID: userId }).sort({
            createdDate: -1,
        }); // Sort by newest first

        res.status(200).send({
            success: true,
            data: orders,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Error fetching user orders",
            error: err.message,
        });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).send(JSON.stringify(orders));
    } catch (err) {
        res.status(500).send({
            message: "Error fetching orders",
            error: err.message,
        });
    }
});

// Get a single order by ID
router.get("/:id", async (req, res) => {
    try {
        const order_id = req.params.id;
        const order = await Order.findById(order_id);
        if (!order) return res.status(404).send({ message: "Order not found" });

        res.status(200).send(JSON.stringify(order));
    } catch (err) {
        res.status(500).send({
            message: "Error fetching the order",
            error: err.message,
        });
    }
});

// Create a new order
router.post("/create", async (req, res) => {
    try {
        // Validate items to ensure they have price fields
        const items = req.body.data.items.map((item) => ({
            ...item,
            price: parseFloat(item.price || 0),
            item_completed:
                item.item_completed !== undefined ? item.item_completed : false,
        }));

        // Create a new order object using the data from the request body
        const newOrder = new Order({
            userID: req.body.data.userID,
            firstName: req.body.data.firstName,
            lastName: req.body.data.lastName,
            username: req.body.data.username || "User", // Add default username
            address: req.body.data.address,
            city: req.body.data.city,
            country: req.body.data.country,
            zipCode: req.body.data.zipCode,
            items: items,
            createdDate: new Date(),
            deliveryMethod: req.body.data.deliveryMethod,
            totalAmount: parseFloat(req.body.data.totalAmount || 0),
        });

        try {
            await newOrder.save();
            console.log("Order created successfully:", newOrder._id);
        } catch (saveErr) {
            console.error("Order save error:", saveErr);
            if (saveErr.errors) {
                Object.keys(saveErr.errors).forEach((field) => {
                    console.error(
                        `Field ${field} error:`,
                        saveErr.errors[field].message
                    );
                });
            }
            throw saveErr;
        }

        res.status(200).send({
            message: "Order created successfully",
            order: newOrder,
        });
    } catch (err) {
        res.status(500).send({
            message: "Error creating order",
            error: err.message,
        });
    }
});

// Update an order by ID
router.put("/update/:id", async (req, res) => {
    try {
        const order_id = req.params.id;

        // Validate incoming data
        if (req.body.data.items) {
            req.body.data.items = req.body.data.items.map((item) => ({
                ...item,
                price: parseFloat(item.price || 0),
                item_completed:
                    item.item_completed !== undefined
                        ? item.item_completed
                        : false,
            }));
        }

        // Update the order with the provided data
        const updatedOrder = await Order.findByIdAndUpdate(
            order_id,
            req.body.data,
            { new: true, runValidators: true }
        );

        if (!updatedOrder)
            return res.status(404).send({ message: "Order not found" });

        res.status(200).send({
            message: "Order updated successfully",
            order: updatedOrder,
        });
    } catch (err) {
        res.status(500).send({
            message: "Error updating order",
            error: err.message,
        });
    }
});

// Delete an order by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const order_id = req.params.id;
        const deletedOrder = await Order.findByIdAndDelete(order_id);

        if (!deletedOrder)
            return res.status(404).send({ message: "Order not found" });

        res.status(200).send({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).send({
            message: "Error deleting order",
            error: err.message,
        });
    }
});

// Get order tracking information
router.get("/track/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select(
            "deliveryStatus trackingNumber estimatedDeliveryDate createdDate items"
        );

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        res.status(200).send({
            orderStatus: order.deliveryStatus,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDeliveryDate,
            orderDate: order.createdDate,
            items: order.items,
        });
    } catch (err) {
        res.status(500).send({
            message: "Error tracking order",
            error: err.message,
        });
    }
});

// Update delivery status
router.put("/delivery-status/:id", async (req, res) => {
    try {
        const { status, trackingNumber, estimatedDeliveryDate } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        order.deliveryStatus = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDeliveryDate)
            order.estimatedDeliveryDate = estimatedDeliveryDate;

        await order.save();
        res.status(200).send({ message: "Delivery status updated", order });
    } catch (err) {
        res.status(500).send({
            message: "Error updating delivery status",
            error: err.message,
        });
    }
});

// Select delivery method
router.post("/select-delivery", async (req, res) => {
    try {
        const { orderId, deliveryMethod } = req.body.data;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        order.deliveryMethod = deliveryMethod;

        // Set estimated delivery date based on delivery method
        const today = new Date();
        switch (deliveryMethod) {
            case "standard":
                order.estimatedDeliveryDate = new Date(
                    today.setDate(today.getDate() + 5)
                );
                break;
            case "express":
                order.estimatedDeliveryDate = new Date(
                    today.setDate(today.getDate() + 2)
                );
                break;
            case "self-collection":
                order.estimatedDeliveryDate = new Date(
                    today.setDate(today.getDate() + 1)
                );
                order.deliveryStatus = "processing";
                break;
        }

        await order.save();
        res.status(200).send({
            message: "Delivery method selected",
            deliveryMethod: order.deliveryMethod,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
        });
    } catch (err) {
        console.error("Error selecting delivery method:", err);
        res.status(500).send({
            message: "Error selecting delivery method",
            error: err.message,
        });
    }
});

module.exports = router;
