const express = require("express");
const mongoose = require("mongoose");
const { Order } = require("../models/orders");
const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.status(200).send(JSON.stringify(orders));
  } catch (err) {
    res.status(500).send({ message: "Error fetching orders", error: err });
  }
});

// Get a single order by ID
router.get("/:id", async (req, res) => {
  try {
    const order_id = req.params.id;
    const order = await Order.findById(order_id); // Fetch the order by its ID
    if (!order) return res.status(404).send({ message: "Order not found" });

    res.status(200).send(JSON.stringify(order));
  } catch (err) {
    res.status(500).send({ message: "Error fetching the order", error: err });
  }
});

// Create a new order
router.post("/create", async (req, res) => {
  try {
    // Create a new order object using the data from the request body
    const newOrder = new Order({
      userID: req.body.data.userID,
      firstName: req.body.data.firstName,
      lastName: req.body.data.lastName,
      address: req.body.data.address,
      city: req.body.data.city,
      country: req.body.data.country,
      zipCode: req.body.data.zipCode,
      totalAmount: req.body.data.totalAmount,
      items: req.body.data.items,
      createdDate: new Date(),
    });

    await newOrder.save(); // Save the new order to the database
    res.status(201).send({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    res.status(500).send({ message: "Error creating order", error: err });
  }
});

// Update an order by ID
router.put("/update/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    // Update the order with the provided data
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        firstName: req.body.data.firstName,
        lastName: req.body.data.lastName,
        address: req.body.data.address,
        city: req.body.data.city,
        country: req.body.data.country,
        zipCode: req.body.data.zipCode,
        totalAmount: req.body.data.totalAmount,
        items: req.body.data.items,
      },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).send({ message: "Order not found" });

    res.status(200).send({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).send({ message: "Error updating order", error: err });
  }
});

// Delete an order by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const order_id = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(order_id);

    if (!deletedOrder) return res.status(404).send({ message: "Order not found" });

    res.status(200).send({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting order", error: err });
  }
});

module.exports = router;
