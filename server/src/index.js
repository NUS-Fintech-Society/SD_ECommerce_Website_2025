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
// ✅ Apply allowCors middleware before routes
// const allowCors = (req, res, next) => {
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET,OPTIONS,PATCH,DELETE,POST,PUT"
//     );
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
//     );

//     if (req.method === "OPTIONS") {
//         return res.status(200).end();
//     }

//     next();
// };

const allowedOrigins = [
    "https://sd-e-commerce-website-2025-client.vercel.app",
    frontendURL,
];

const corsOptions = {
    origin: function(origin, callback) {
        // console.log("Origin:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Access-Control-Allow-Methods",
        "Access-Control-Request-Headers",
        "Access-Control-Allow-Headers",
    ],
    optionsSuccessStatus: 200,
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Pre-flight OPTIONS requests
app.options("*", cors(corsOptions));

// app.use(allowCors); // ✅ Apply CORS middleware globally
// const corsOptions = {
//     origin: "*",
//     credentials: true, //access-control-allow-credentials:true
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//         "Content-Type",
//         "Authorization",
//         "Access-Control-Allow-Methods",
//         "Access-Control-Request-Headers",
//     ],
//     optionSuccessStatus: 200,
// };

// app.use(express.json());
// app.use(cors(corsOptions));

app.use(bodyParser);
app.use(isAuth);

app.use("/product", product);
app.use("/users", user);
app.use("/order", order);
app.use("/email", email);
app.use("/verify", userVerification);
app.use("/listings", listingsRoute);
app.use("/drafts", draftsRoute);
app.use("/adminRequest", adminRequest);
app.use("/admin", admin);
// Add a test route to verify CORS is working
app.get("/api/test-cors", (req, res) => {
    res.json({ message: "CORS is configured correctly!" });
});

const connectDB = require("./db");

(async () => {
    await connectDB();
    if (!isProduction) {
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`🚀 Server running locally on port ${port}`);
        });
    }
})();

// mongoose
//     .connect(`${process.env.MONGODB_URI}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }) // Changing to MongoAtlas //Use localhost for now
//     .then(() => console.log("Connected to MongoDB..."))
//     .catch((err) => console.error("Could not connect to MongoDB..."));

// if (!isProduction) {
//     const port = process.env.PORT || 5000;
//     app.listen(port, () => {
//         console.log(`🚀 Server running locally on port ${port}`);
//     });
// }

// Export app for Vercel deployment
module.exports = app;
