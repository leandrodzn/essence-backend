const { Event, WebTemplate, WebTemplateEvent } = require("../../../../models");
const { validatorCreateWebTemplate } = require("../validators");
const { validatorId } = require("../../../../utils/validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const {
  uploadSingleFile,
  deleteFile,
  getUrlPublicFile,
} = require("../../../../utils/storage-helper");
const { Op } = require("sequelize");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const createWebTemplate = async (req, res) => {
  let transaction,
    back = {};
  try {
    const image = await uploadSingleFile({ req, res });
    back.image = image;

    // Validate front data
    await validatorCreateWebTemplate(req);

    transaction = await Database.transaction();

    const { name, link, description, price, events } = req.body;

    // Creation of template
    let webTemplateModel = await WebTemplate.create(
      {
        name,
        link,
        description,
        price,
        image,
      },
      { transaction }
    );

    // Find existing events
    const criteria = {
      where: {
        id: events,
      },
    };
    const eventModels = await Event.findAll(criteria, { transaction });

    // Create relation template - event
    const webTemplateEventsToCreate = eventModels.map((eventModel) => {
      return {
        event: eventModel.id,
        web_template: webTemplateModel.id,
      };
    });

    let webTemplateEventModels = await WebTemplateEvent.bulkCreate(
      webTemplateEventsToCreate,
      {
        transaction,
      }
    );

    await transaction.commit();

    // Get list of events for template
    webTemplateEventModels = await WebTemplateEvent.findAll({
      where: {
        id: webTemplateEventModels.map(
          (webTemplateEvent) => webTemplateEvent.id
        ),
      },
      attributes: ["id", "event", "web_template"],
      include: [
        {
          model: Event,
          attributes: ["id", "name", "description"],
        },
      ],
    });

    // Settings fields in response
    webTemplateModel.setDataValue("image", getUrlPublicFile(image));
    webTemplateModel.setDataValue(
      "WebTemplateEvents",
      webTemplateEventModels || []
    );

    // Response
    res.status(201).json({
      status: "OK",
      data: webTemplateModel,
    });
  } catch (error) {
    if (
      transaction &&
      (!transaction?.finished || transaction?.finished !== "commit")
    )
      await transaction.rollback();

    if (back?.image) await deleteFile(back.image);
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const updateWebTemplateById = async (req, res) => {
  let transaction,
    back = {};
  try {
    const image = await uploadSingleFile({ req, res });
    back.image = image;

    // Validate params
    await validatorId(req);

    // Validate front data
    await validatorCreateWebTemplate(req, true);

    transaction = await Database.transaction();

    const { name, link, description, price, events } = req.body;

    // Find register
    let webTemplateModel = await WebTemplate.findByPk(req.params.id, {
      transaction,
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    // Update web template data
    let dataToUpdate = {
      name,
      link,
      description,
      price,
    };

    if (image) dataToUpdate.image = image;

    webTemplateModel = await webTemplateModel.update(dataToUpdate, {
      transaction,
    });

    // Find existing events
    const criteria = {
      where: {
        id: events,
      },
    };
    const eventModels = await Event.findAll(criteria, { transaction });

    // Find or create relations event - template
    for (const event of eventModels) {
      let existEventForWebTemplate = await WebTemplateEvent.findOne(
        {
          where: {
            web_template: webTemplateModel.id,
            event: event.id,
          },
        },
        { transaction }
      );

      // If it is a new relation create it
      if (!existEventForWebTemplate)
        await WebTemplateEvent.create(
          {
            event: event.id,
            web_template: webTemplateModel.id,
          },
          { transaction }
        );
    }

    // Delete others relations event - template
    const webTemplateEventDeleteCriteria = {
      where: {
        event: {
          [Op.notIn]: eventModels.map((eventModel) => eventModel.id),
        },
        web_template: webTemplateModel.id,
      },
    };
    const webTemplateEventsToDelete = await WebTemplateEvent.findAll(
      webTemplateEventDeleteCriteria,
      { transaction }
    );

    await WebTemplateEvent.destroy(
      {
        bulk: true,
        where: { id: webTemplateEventsToDelete.map((record) => record.id) },
      },
      { transaction }
    );

    // Finish operations
    await transaction.commit();

    // Find events for template
    let webTemplateEventModels = await WebTemplateEvent.findAll({
      where: {
        event: eventModels.map((eventModel) => eventModel.id),
        web_template: webTemplateModel.id,
      },
      attributes: ["id", "event", "web_template"],
      include: [
        {
          model: Event,
          attributes: ["id", "name", "description"],
        },
      ],
    });

    // Setting fields in response
    webTemplateModel.setDataValue(
      "image",
      getUrlPublicFile(webTemplateModel.image)
    );
    webTemplateModel.setDataValue(
      "WebTemplateEvents",
      webTemplateEventModels || []
    );

    // Response
    res.status(201).json({
      status: "OK",
      data: webTemplateModel,
    });
  } catch (error) {
    if (
      transaction &&
      (!transaction?.finished || transaction?.finished !== "commit")
    )
      await transaction.rollback();

    if (back?.image) await deleteFile(back.image);
    res.jsonError(error);
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getAllWebTemplates = async (req, res) => {
  try {
    let criteria = {
      attributes: ["id", "name", "price", "description", "link", "image"],
    };

    const webTemplates = await WebTemplate.findAll(criteria);

    webTemplates.forEach((webTemplate) => {
      if (webTemplate?.image)
        webTemplate.setDataValue("image", getUrlPublicFile(webTemplate.image));
    });

    res.status(200).json({
      status: "OK",
      data: webTemplates,
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
const getWebTemplateById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const webTemplateModel = await WebTemplate.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "name", "price", "description", "link", "image"],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    if (webTemplateModel?.image)
      webTemplateModel.setDataValue(
        "image",
        getUrlPublicFile(webTemplateModel.image)
      );

    res.status(200).json({
      status: "OK",
      data: webTemplateModel,
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
const deleteWebTemplateById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const webTemplateModel = await WebTemplate.findByPk(req.params.id);

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.BOOK_NOT_FOUND,
      });

    const webTemplateModelImage = webTemplateModel?.image;

    await webTemplateModel.destroy();

    if (webTemplateModelImage) await deleteFile(webTemplateModelImage);

    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  createWebTemplate,
  updateWebTemplateById,
  getAllWebTemplates,
  getWebTemplateById,
  deleteWebTemplateById,
};
