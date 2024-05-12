const {
  createWebTemplate,
  updateWebTemplateById,
  getAllWebTemplates,
  getWebTemplateById,
  deleteWebTemplateById,
} = require("../controllers");

module.exports = {
  routes: [
    {
      method: "get",
      path: "/admin/web-templates",
      action: getAllWebTemplates,
    },
    {
      method: "get",
      path: "/admin/web-templates/:id",
      action: getWebTemplateById,
    },
    {
      method: "post",
      path: "/admin/web-templates",
      action: createWebTemplate,
    },
    {
      method: "put",
      path: "/admin/web-templates/:id",
      action: updateWebTemplateById,
    },
    {
      method: "delete",
      path: "/admin/web-templates/:id",
      action: deleteWebTemplateById,
    },
  ],
};
