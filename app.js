"use strict";

const express = require("express");
const path = require("path");
const createError = require("http-errors");
const logger = require("morgan");
const JsonError = require("./src/utils/json-error");
const CustomError = require("./src/utils/custom-error");
require("./src/config/env");

const models = require("./src/models");
const app = express();

// Middleware for logging HTTP requests in development environment
app.use(logger("dev"));

// Middleware for parsing JSON requests with a limit of 50MB
app.use(express.json({ limit: "50mb" }));

// Middleware for parsing URL-encoded requests with a limit of 50MB
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// Middleware for handling Cross-Origin Resource Sharing (CORS) headers
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization"
  );
  next();
});

// Setup view engine for rendering views with Pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Serve static files from the "public" directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Middleware for handling JSON errors
app.use(JsonError);

// Make CustomError globally accessible
global.CustomError = CustomError;

// Load API routes and pass the express app instance
require("./src/api")(app);

// Middleware for handling 404 errors
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler middleware
app.use((err, req, res, next) => {
  // Set locals, providing error details in development mode
  res.locals.message = err.message;
  res.locals.error = err;

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
