const bodyParser = require('body-parser');
const express = require('express');
const middleware = express.Router();

// Use body-parser middleware
middleware.use(bodyParser.json());
middleware.use(bodyParser.urlencoded({ extended: true }));

module.exports = middleware;