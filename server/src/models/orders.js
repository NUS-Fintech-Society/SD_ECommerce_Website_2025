const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    username: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    trackingNumber: { type: String },
    estimatedDeliveryDate: { type: Date },
    items: [
        {
            title: { type: String },
            colour: { type: String },
            size: { type: String },
            images: [{ type: String }],
            quantity: { type: Number, required: true },
            deliveryMethod: {
                type: String,
                enum: ["standard", "express", "self-collection"],
                required: true,
            },
            deliveryStatus: {
                type: String,
                enum: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "ready-for-collection",
                    "collected",
                ],
                default: "pending",
            },
        },
    ],
    createdDate: { type: Date, required: true },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    totalAmount: { type: Number, required: true },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = { Order };
