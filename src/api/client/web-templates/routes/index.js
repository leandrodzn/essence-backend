const {
  getAllWebTemplates,
  getWebTemplateById,
  getWebTemplateFavoriteById,
  createWebTemplateFavorite,
  deleteWebTemplateFavorite,
} = require("../controllers");
const constants = require("../../../../utils/constants");
const rateLimit = require("express-rate-limit");
const { isAuthenticatedCustomer } = require("../../../../config/auth");

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
      path: "/client/web-templates",
      action: getAllWebTemplates,
      middleware: rateLimitRequest,
    },
    {
      method: "get",
      path: "/client/web-templates/:id",
      action: getWebTemplateById,
      middleware: rateLimitRequest,
    },
    {
      method: "get",
      path: "/client/web-templates/:id/favorite",
      action: getWebTemplateFavoriteById,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
    {
      method: "post",
      path: "/client/web-templates/:id/favorite",
      action: createWebTemplateFavorite,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
    {
      method: "delete",
      path: "/client/web-templates/:id/favorite",
      action: deleteWebTemplateFavorite,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
  ],
};
