const { createAdministrator } = require("../controllers");
const { isAuthenticatedAdministrator } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/admin/administrators",
      action: createAdministrator,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
  ],
};
