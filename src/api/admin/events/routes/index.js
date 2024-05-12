const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
} = require("../controllers");

module.exports = {
  routes: [
    {
      method: "post",
      path: "/admin/events",
      action: createEvent,
    },
    {
      method: "get",
      path: "/admin/events",
      action: getAllEvents,
    },
    {
      method: "get",
      path: "/admin/events/:id",
      action: getEventById,
    },
    {
      method: "put",
      path: "/admin/events/:id",
      action: updateEventById,
    },
    {
      method: "delete",
      path: "/admin/events/:id",
      action: deleteEventById,
    },
  ],
};
