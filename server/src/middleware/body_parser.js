const bodyParser = require("body-parser");
const express = require("express");
const middleware = express.Router();

// Use body-parser middleware
middleware.use(bodyParser.json({ limit: "20mb" }));
middleware.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

module.exports = middleware;
