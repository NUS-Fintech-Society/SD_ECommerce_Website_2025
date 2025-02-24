const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    sizingChart: [{ type: String }],
    specifications: [
        {
            colour: String,
            size: String,
            quantity: String,
            price: String,
        },
    ],
    deliveryMethods: {
        shipping: { type: Boolean, default: false },
        selfCollection: { type: Boolean, default: false },
    },
    collectionInfo: { type: String },
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = { Listing };
