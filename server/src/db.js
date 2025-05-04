// src/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    const db = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
};

module.exports = connectDB;
