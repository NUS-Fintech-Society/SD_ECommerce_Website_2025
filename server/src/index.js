const express = require('express')
require('dotenv').config();
const isAuth = require("./middleware/auth");
const cors = require('cors');

const product = require("./routes/product_route");
const user = require("./routes/user_route");
const order = require("./routes/order_route");

// Importing the mongooose package
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT;

mongoose
    .connect(`${process.env.MONGO_URI}`) // Changing to MongoAtlas //Use localhost for now
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(cors());
app.use(isAuth);
app.use("/product", product);
app.use("/users", user);
app.use("/order", order);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
