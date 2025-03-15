const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
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
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
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

exports.Order = Order;
