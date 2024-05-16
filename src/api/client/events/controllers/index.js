const { Event } = require("../../../../models");
const {} = require("../validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAndCountAll({
      attributes: ["id", "name", "description"],
    });

    res.status(200).json({
      status: "OK",
      data: events,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  getAllEvents,
};
