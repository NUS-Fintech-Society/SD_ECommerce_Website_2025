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
    trackingNumber: { type: String },
    estimatedDeliveryDate: { type: Date },
    items: [
        {
            title: { type: String, required: true },
            colour: { type: String, required: true },
            size: { type: String, required: true },
            images: [{ type: String }],
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            item_completed: { type: Boolean, default: false },
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
