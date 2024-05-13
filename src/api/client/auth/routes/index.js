const { authLogin } = require("../controllers");
const constants = require("../../../../utils/constants");
const rateLimit = require("express-rate-limit");

const rateLimitRequest = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // limit each IP to 50 requests per windowMs
  message: {
    status: constants.response.error,
    message: "The limit of allowed requests has been exceeded",
  },
});

module.exports = {
  routes: [
    {
      method: "post",
      path: "/client/auth/login",
      action: authLogin,
      middleware: rateLimitRequest,
    },
  ],
};
