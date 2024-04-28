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
      path: "/events",
      action: createEvent,
    },
    {
      method: "get",
      path: "/events",
      action: getAllEvents,
    },
    {
      method: "get",
      path: "/events/:id",
      action: getEventById,
    },
    {
      method: "put",
      path: "/events/:id",
      action: updateEventById,
    },
    {
      method: "delete",
      path: "/events/:id",
      action: deleteEventById,
    },
  ],
};
