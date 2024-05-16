const { getAllEvents } = require("../controllers");
const constants = require("../../../../utils/constants");
const rateLimit = require("express-rate-limit");

const rateLimitRequest = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // limit each IP to 40 requests per windowMs
  message: {
    status: constants.response.error,
    message: "The limit of allowed requests has been exceeded",
  },
});

module.exports = {
  routes: [
    {
      method: "get",
      path: "/client/events",
      action: getAllEvents,
      middleware: rateLimitRequest,
    },
  ],
};
