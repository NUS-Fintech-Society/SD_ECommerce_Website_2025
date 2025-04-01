const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String, // Assuming images are stored as URLs
      required: true,
    },
  ],
  sizingChart: [
    {
      type: String, // Assuming images are stored as URLs
      required: true,
    },
  ],
  specifications: [
    {
      colour: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: String, required: true },
      price: { type: String, required: true },
    },
  ],
  deliveryMethods: {
    shipping: {
      available: { type: Boolean, required: true },
      cost: { type: Number, required: true },
    },
    selfCollection: {
      available: { type: Boolean, required: true },
      location: { type: String, required: true },
    },
  },
  collectionInfo: {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
