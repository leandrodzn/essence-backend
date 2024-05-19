const { getAllWebTemplatesFavorites } = require("../controllers");
const { isAuthenticatedCustomer } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "get",
      path: "/client/favorites",
      action: getAllWebTemplatesFavorites,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
  ],
};
