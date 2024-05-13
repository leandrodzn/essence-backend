const { createCustomer } = require("../controllers");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/client/customers",
      action: createCustomer,
    },
  ],
};
