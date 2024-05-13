const {
  createWebTemplate,
  updateWebTemplateById,
  getAllWebTemplates,
  getWebTemplateById,
  deleteWebTemplateById,
} = require("../controllers");
const { isAuthenticatedAdministrator } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "get",
      path: "/admin/web-templates",
      action: getAllWebTemplates,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "get",
      path: "/admin/web-templates/:id",
      action: getWebTemplateById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "post",
      path: "/admin/web-templates",
      action: createWebTemplate,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "put",
      path: "/admin/web-templates/:id",
      action: updateWebTemplateById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "delete",
      path: "/admin/web-templates/:id",
      action: deleteWebTemplateById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
  ],
};
