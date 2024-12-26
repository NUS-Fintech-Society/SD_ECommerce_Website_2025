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
  images: [{
    type: String, // Assuming images are stored as URLs
    required: true
  }],
  sizingChart: [{
    type: String, // Assuming images are stored as URLs
    required: true
  }],
  specifications: [{
    colour: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: String, required: true }
  }],
  deliveryMethods: {
    shipping: { type: Boolean, required: true },
    selfCollection: { type: Boolean, required: true }
  },
  collectionInfo: {
    type: String,
    required: true,
  }
});

const Product = mongoose.model("Product", productSchema);

exports.Product = Product;