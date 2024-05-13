const { createAdministrator } = require("../controllers");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/admin/administrators",
      action: createAdministrator,
    },
  ],
};
