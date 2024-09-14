const {
  createAdministrator,
  getAdministratorMe,
  createInitialRootAdministrator,
} = require("../controllers");
const { isAuthenticatedAdministrator } = require("../../../../config/auth");
const constants = require("../../../../utils/constants");
const rateLimit = require("express-rate-limit");

const rateLimitRequest = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: constants.response.error,
    message: "The limit of allowed requests has been exceeded",
  },
});

module.exports = {
  routes: [
    {
      method: "post",
      path: "/admin/administrators",
      action: createAdministrator,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "get",
      path: "/admin/me",
      action: getAdministratorMe,
      middleware: isAuthenticatedAdministrator,
    },
    {
      method: "post",
      path: "/admin/initial-user",
      action: createInitialRootAdministrator,
      middleware: rateLimitRequest,
    },
  ],
};
