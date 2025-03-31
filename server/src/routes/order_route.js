const express = require("express");
const mongoose = require("mongoose");
const { Order } = require("../models/orders");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require('../../src/models/products');

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { order, deliveryMethod } = req.body.data;
    console.log(order, deliveryMethod);

    const orderItems = await Promise.all(
      order.items.map(async (item) => {
        try {
          const product = await Product.findOne({ title: item.product.title });

          if (!product) {
            throw new Error(`Product with title ${item.product.title} not found.`);
          }

          return {
            title : product.title,
            colour : product.specifications[0].colour,
            size: product.specifications[0].size,
            images: product.images,
            quantity: item.quantity,

          };
        } catch (err) {
          console.error(`Error fetching product: ${err.message}`);
          throw err;
        }
      })
    );

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
    }
    const totalPriceProduct = isNaN(order.totalAmount) ? 0 : parseFloat(order.totalAmount);

    //TODO: REPLACE these values with actual inputs from user 
    const newOrder = new Order({
      userID: "userID",
      firstName: "firstName",
      lastName: "lastName",
      address: "address",
      city: "city",
      country: "country",
      zipCode: "zipCode",
      items: orderItems,
      createdDate: new Date(),
      deliveryMethod: deliveryMethod,
      totalAmount: totalPriceProduct + deliveryFee,
    });

    // Save the new order to the database
    await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: req.body.data.userID,
      payment_method_types: ["card", "paynow", "grabpay"],
      line_items: [
        ...order.items.map((item) => ({
          price_data: {
            currency: "sgd",
            product_data: {
              name: item.product.title,
            },
            unit_amount: item.product.price * 100,
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
            unit_amount: deliveryFee * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5001/order/success`,
      cancel_url: `http://localhost:5001/order/cancel`,
    });

    // Send the response once, after the order is saved
    res.status(200).send({
      message: "Checkout session created",
      url: session.url,
    });
  } catch (err) {
    // Catch any errors and send a single response
    console.error("Error in checkout session:", err.message);
    
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
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(err);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Update order payment status
    try {
      const order = await Order.findOne({
        userID: session.client_reference_id,
      });
      if (order) {
        console.log("trying to update payment status")
        order.paymentStatus = "completed";
        await order.save();
        console.log("updated payment status")
      }
    } catch (err) {
      return res.status(500).send({ message: "Error updating order status" });
    }
  }

  res.json({ received: true });
});

// Tester routes for success and cancel
router.get("/success", (req, res) => {
  res.send(`
    <script>
      // Close the Stripe tab and return to the main app, send message to Cart.tsx for successful payment 
      window.opener.postMessage({ success: true }, "*");
      window.close();
    </script>
    <p>Payment successful! If this page does not close automatically, please close it manually.</p>
  `);
});

router.get("/cancel", (req, res) => {
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
      deliveryMethod: req.body.data.deliveryMethod,
      totalAmount: req.body.data.totalAmount,
    });

    await newOrder.save(); // Save the new order to the database
    res
      .status(200)
      .send({ message: "Order created successfully", order: newOrder });
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

    if (!updatedOrder)
      return res.status(404).send({ message: "Order not found" });

    res
      .status(200)
      .send({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).send({ message: "Error updating order", error: err });
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
    res.status(500).send({ message: "Error deleting order", error: err });
  }
});

// Get order tracking information
router.get("/track/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select("deliveryStatus trackingNumber estimatedDeliveryDate createdDate")
      .populate("items.product", "title");

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
    res.status(500).send({ message: "Error tracking order", error: err });
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
    res
      .status(500)
      .send({ message: "Error updating delivery status", error: err });
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
    console.error("Error selecting delivery method:", err); // Log any errors
    res
      .status(500)
      .send({ message: "Error selecting delivery method", error: err });
  }
});

module.exports = router;
