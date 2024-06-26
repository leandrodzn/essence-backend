"use strict";

const { Strategy } = require("passport-http-bearer");
const auth = require("../configAdministrator");
const jwt = require("jsonwebtoken");

module.exports = new Strategy(async (token, cb) => {
  jwt.verify(
    token,
    auth.secret,
    { ignoreExpiration: auth.ignoreExpiration },
    (error, decoded) => {
      if (!error) {
        return cb(null, decoded, token);
      }
      return cb(error, null, token);
    }
  );
});
