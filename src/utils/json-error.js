"use strict";
const Response = require("./response");

module.exports = (req, res, next) => {
  res.jsonError = (error, message) => {
    console.error(error);

    let status = error && error.status ? error.status : 500;
    let cMessage = error ? error.message : undefined;
    let errors = error && error.errors ? error.errors : undefined;
    let name = error && error.name ? error.name : "ERROR";

    let response = new Response(
      null,
      status,
      name,
      cMessage || message,
      errors
    );

    res.status(status).json(response.getMessage());
  };

  next();
};
