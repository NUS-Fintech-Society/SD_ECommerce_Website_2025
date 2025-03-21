const express = require("express");
require("dotenv").config();
const isAuth = require("./middleware/auth");
const bodyParser = require("./middleware/body_parser");
const cors = require("cors");

const product = require("./routes/product_route");
const user = require("./routes/user_route");
const order = require("./routes/order_route");
const email = require("./routes/email_route");
const listingsRoute = require("./routes/listings_route");
const draftsRoute = require("./routes/drafts_route");
const userVerification = require("./routes/user_verification_route");
const adminRequest = require("./routes/admin_request_route");
const admin = require("./routes/admin_route");

// Importing the mongooose package
const mongoose = require("mongoose");
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
    origin: isProduction ? frontendURL : "*",
    credentials: true, //access-control-allow-credentials:true
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionSuccessStatus: 200,
};

mongoose
    .connect(`${process.env.MONGO_URI}`) // Changing to MongoAtlas //Use localhost for now
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use(cors(corsOptions));
app.use(isAuth);
app.use(bodyParser);

app.use("/product", product);
app.use("/users", user);
app.use("/order", order);
app.use("/email", email);
app.use("/verify", userVerification);
app.use("/listings", listingsRoute);
app.use("/drafts", draftsRoute);
app.use("/adminRequest", adminRequest);
app.use("/admin", admin);

if (!isProduction) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`🚀 Server running locally on port ${port}`);
    });
}

// Export app for Vercel deployment
module.exports = app;
