"use strict";

module.exports = class CustomError extends Error {
  constructor({ message, name = "CustomError", status = 500, errors, type }) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = name;
    this.message = message ?? "Error";
    this.status = status ?? 500;
    this.errors = errors ?? undefined;
    this.type = type ?? undefined;
  }
};
