const {
  createWebTemplateContact,
  getAllWebTemplateContacts,
  deleteTemplateContactById,
} = require("../controllers");
const { isAuthenticatedCustomer } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/client/template-contact/:id",
      action: createWebTemplateContact,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
    {
      method: "get",
      path: "/client/template-contact",
      action: getAllWebTemplateContacts,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
    {
      method: "delete",
      path: "/client/template-contact/:id",
      action: deleteTemplateContactById,
      middleware: (req, res, next) => isAuthenticatedCustomer(req, res, next),
    },
  ],
};
