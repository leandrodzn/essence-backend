const { createCustomer } = require("../controllers");
const { isAuthenticatedCustomer } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/client/customers",
      action: createCustomer,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
  ],
};
