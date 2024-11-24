const {
  updateReadedWebTemplateContactById,
  getAllWebTemplateContacts,
  getOneWebTemplateContactById,
  deleteTemplateContactById,
} = require("../controllers");
const { isAuthenticatedAdministrator } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "get",
      path: "/admin/template-contact",
      action: getAllWebTemplateContacts,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "get",
      path: "/admin/template-contact/:id",
      action: getOneWebTemplateContactById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "put",
      path: "/admin/template-contact/:id",
      action: updateReadedWebTemplateContactById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "delete",
      path: "/admin/template-contact/:id",
      action: deleteTemplateContactById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
  ],
};
