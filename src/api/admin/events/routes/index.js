const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
} = require("../controllers");
const { isAuthenticatedAdministrator } = require("../../../../config/auth");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/admin/events",
      action: createEvent,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "get",
      path: "/admin/events",
      action: getAllEvents,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "get",
      path: "/admin/events/:id",
      action: getEventById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "put",
      path: "/admin/events/:id",
      action: updateEventById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
    {
      method: "delete",
      path: "/admin/events/:id",
      action: deleteEventById,
      middleware: (req, res, next) =>
        isAuthenticatedAdministrator(req, res, next),
    },
  ],
};
