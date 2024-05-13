"use strict";

const passport = require("passport");
const jwt = require("jsonwebtoken");
const constants = require("../../utils/constants");
const Response = require("../../utils/response");
const configAdministrator = require("./configAdministrator");
const configCustomer = require("./configCustomer");
const { Administrator, Customer } = require("../../models");
const bcrypt = require("bcrypt");

const jwtStrategyAdministrator = require("./strategies/jwtAdministrator");
const jwtStrategyCustomer = require("./configCustomer");

passport.use("jwtAdministrator", jwtStrategyAdministrator);
passport.use("jwtCustomer", jwtStrategyCustomer);

const auth = () => {
  return passport.initialize();
};

const hashPasswordAdministrator = async (plainPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const salt = await bcrypt.genSalt(parseInt(configAdministrator.salt));
      const hash = await bcrypt.hash(plainPassword, salt);
      resolve(hash);
    } catch (error) {
      reject(error);
    }
  });
};

const generateTokenAdministrator = ({ userId }) => {
  const data = {
    user_id: userId,
    type: "Administrator",
    app: "essence_creatives",
  };

  return jwt.sign(data, configAdministrator.secret, {
    expiresIn: configAdministrator.expiresIn,
  });
};

const isAuthenticatedAdministrator = (req, res, next) => {
  return passport.authenticate(
    "jwtAdministrator",
    { session: false },
    // error, data, token
    async (error, data) => {
      const response401 = () =>
        res
          .status(401)
          .json(
            new Response(
              {},
              401,
              constants.status["401"],
              constants.errors["401"],
              {}
            )
          );

      if (error || !data) return response401();

      const { user_id } = data;

      const criteria = {
        where: {
          id: user_id ?? 0,
        },
        attributes: {
          exclude: ["password", "reset_password_token"],
        },
      };

      const administratorModel = await Administrator.findOne(criteria);

      if (!administratorModel) return response401();

      req.currentUser = {
        id: administratorModel.id,
        type: "Administrator",
        app: "essence_creatives",
        user: administratorModel,
      };

      next();
    }
  )(req, res, next);
};

const hashPasswordCustomer = async (plainPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const salt = await bcrypt.genSalt(parseInt(configCustomer.salt));
      const hash = await bcrypt.hash(plainPassword, salt);
      resolve(hash);
    } catch (error) {
      reject(error);
    }
  });
};

const generateTokenCustomer = ({ userId }) => {
  const data = {
    user_id: userId,
    type: "Customer",
    app: "essence_creatives",
  };

  return jwt.sign(data, configCustomer.secret, {
    expiresIn: configCustomer.expiresIn,
  });
};

const isAuthenticatedCustomer = (req, res, next) => {
  return passport.authenticate(
    "jwtCustomer",
    { session: false },
    // error, data, token
    async (error, data) => {
      const response401 = () =>
        res
          .status(401)
          .json(
            new Response(
              {},
              401,
              constants.status["401"],
              constants.errors["401"],
              {}
            )
          );

      if (error || !data) return response401();

      const { user_id } = data;

      const criteria = {
        where: {
          id: user_id ?? 0,
        },
        attributes: {
          exclude: ["password", "confirmation_token", "reset_password_token"],
        },
      };

      const customerModel = await Customer.findOne(criteria);

      if (!customerModel) return response401();

      req.currentUser = {
        id: customerModel.id,
        type: "Customer",
        app: "essence_creatives",
        user: customerModel,
      };

      next();
    }
  )(req, res, next);
};

const checkPassword = async (plainPassword, hashPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const match = await bcrypt.compare(plainPassword, hashPassword);

      resolve(match ? true : false);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  auth,
  hashPasswordAdministrator,
  generateTokenAdministrator,
  isAuthenticatedAdministrator,
  hashPasswordCustomer,
  generateTokenCustomer,
  isAuthenticatedCustomer,
  checkPassword,
};
