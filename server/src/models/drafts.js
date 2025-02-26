const mongoose = require("mongoose");

const DraftSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Store image file paths or URLs
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

const Draft = mongoose.model("Draft", DraftSchema);
module.exports = { Draft };
