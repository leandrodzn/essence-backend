"use strict";

const env = require("../../config/env");

const toBoolean = (v) => {
  return typeof v === "boolean" ? v : v === "true" || v === 1;
};

const auth = {
  expiresIn: parseInt(env.EC_CLIENT_JWT_EXPIRATION ?? 0),
  ignoreExpiration: toBoolean(env.EC_CLIENT_JWT_IGNORE_EXPIRATION) ?? false,
  salt: parseInt(env.EC_CLIENT_BCRYPT_SALT_ROUNDS ?? 10),
  secret: env.EC_CLIENT_JWT_SECRET,
};

module.exports = {
  auth,
  env,
  ...auth,
};
