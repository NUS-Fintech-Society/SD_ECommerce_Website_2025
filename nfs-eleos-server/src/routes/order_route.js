const express = require("express");
const mongoose = require("mongoose");
const { Order } = require("../models/orders");
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Create a checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: req.body.data.userID,
      payment_method_types: ["card", "paynow", "grabpay"],
      line_items: req.body.data.order.items.map(item => {
        return {
          price_data: {
            currency: "sgd",
            product_data: {
              name: item.product.title
            },
            unit_amount: item.product.price * 100 // in cents
          },
          quantity: item.quantity,
        }
      }),
      success_url: `http://localhost:5000/order/success`, // Temporary URL
      cancel_url: `http://localhost:5000/order/cancel` // Temporary URL
    })
    res.status(200).send({message: "Checkout session successfully created", url: session.url });
  } catch (err) {
    res.status(500).send({message: "Error creating checkout session", error: err });
  }
});

// Tester routes for success and cancel
router.get('/success', (req, res) => {
  res.send("Payment successful! Thank you for your purchase.");
});

router.get('/cancel', (req, res) => {
  res.send("Payment canceled. Please try again.");
});

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
