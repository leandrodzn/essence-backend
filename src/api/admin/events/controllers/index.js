const { Event } = require("../../../../models");
const { validatorCreateEvent } = require("../validators");
const { validatorId } = require("../../../../utils/validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const createEvent = async (req, res) => {
  try {
    // Validate front data
    await validatorCreateEvent(req);

    const { name, description } = req.body;

    const eventModel = await Event.create({
      name,
      description,
    });

    res.status(201).json({
      status: "OK",
      data: eventModel,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();

    res.status(200).json({
      status: "OK",
      data: events,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getEventById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const eventModel = await Event.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!eventModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.EVENT_NOT_FOUND,
      });

    res.status(200).json({
      status: "OK",
      data: eventModel,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const updateEventById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    // Validate front data to update
    await validatorCreateEvent(req, true);

    const { name, description } = req.body;

    let eventModel = await Event.findByPk(req.params.id);

    if (!eventModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.EVENT_NOT_FOUND,
      });

    let dataToUpdate = {
      name,
      description,
    };

    eventModel = await eventModel.update(dataToUpdate);

    res.status(200).json({
      status: "OK",
      data: eventModel,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const deleteEventById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const eventModel = await Event.findByPk(req.params.id);

    if (!eventModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.EVENT_NOT_FOUND,
      });

    await eventModel.destroy();

    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};
