const { Event, WebTemplate, WebTemplateEvent, Image } = require("../../../../models");
const { validatorCreateWebTemplate } = require("../validators");
const { validatorId } = require("../../../../utils/validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const {
  deleteFile,
  getUrlPublicFile,
  uploadMultipleFiles,
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
    // Upload multiple files
    const imageUploadResult = await uploadMultipleFiles({
      req,
      res,
    });

    back.imageUploadResult = imageUploadResult;

    // Validate the data sent from the client
    await validatorCreateWebTemplate(req);

    transaction = await Database.transaction();

    const { name, link, description, price, events } = req.body;

    // Create the web template model
    let webTemplateModel = await WebTemplate.create(
      {
        name,
        link,
        description,
        price
      },
      { transaction }
    );

    // Create models for the main and additional images
    let imageModels = [];

    // Main image
    if (imageUploadResult.mainImage) {
      const mainImageModel = await Image.create(
        {
          web_template: webTemplateModel.id,
          link: imageUploadResult.mainImage,
          is_thumbnail: true, // Indicates that this is the main image
        },
        { transaction }
      );
      webTemplateModel = await webTemplateModel.update(
        { image: mainImageModel.id },
        { transaction }
      );
      imageModels.push(mainImageModel);
    }

    // Additional images
    if (imageUploadResult.additionalImages.length > 0) {
      const additionalImageModels = await Image.bulkCreate(
        imageUploadResult.additionalImages.map((imagePath) => ({
          web_template: webTemplateModel.id,
          link: imagePath,
          is_thumbnail: false, // These are not main images
        })),
        { transaction }
      );
      imageModels = imageModels.concat(additionalImageModels);
    }

    // Find existing events
    const criteria = {
      where: {
        id: events,
      },
    };
    const eventModels = await Event.findAll(criteria, { transaction });

    // Create relationships between template and events
    const webTemplateEventsToCreate = eventModels.map((eventModel) => ({
      event: eventModel.id,
      web_template: webTemplateModel.id,
    }));

    let webTemplateEventModels = await WebTemplateEvent.bulkCreate(
      webTemplateEventsToCreate,
      { transaction }
    );

    await transaction.commit();

    // Get the list of related events
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

    // Set response fields
    webTemplateModel.setDataValue(
      "images",
      imageModels.map((img) => ({
        id: img.id,
        url: getUrlPublicFile(img.link),
        is_thumbnail: img.is_thumbnail,
      }))
    );
    webTemplateModel.setDataValue(
      "WebTemplateEvents",
      webTemplateEventModels || []
    );

    // Respond with success
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

    if (back?.imageUploadResult) {
      const { mainImage, additionalImages } = back.imageUploadResult;
      if (mainImage) await deleteFile(mainImage);
      if (additionalImages.length > 0) {
        for (const additionalImage of additionalImages) {
          await deleteFile(additionalImage);
        }
      }
    }

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
    // Upload multiple files
    const imageUploadResult = await uploadMultipleFiles({
      req,
      res, // Limit increased to 4 additional images
    });

    back.imageUploadResult = imageUploadResult;

    // Validate parameters
    await validatorId(req);

    // Validate the data sent from the client
    await validatorCreateWebTemplate(req, true);

    transaction = await Database.transaction();

    const { name, link, description, price, events } = req.body;

    // Find the existing record
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

    webTemplateModel = await webTemplateModel.update(dataToUpdate, {
      transaction,
    });

    // Update existing images
    let existingImages = await Image.findAll({
      where: { web_template: webTemplateModel.id },
      transaction,
    });

    // Delete images that will no longer be used
    const imagesToDelete = existingImages.filter(
      (img) =>
        img.is_thumbnail ||
        !imageUploadResult.additionalImages.includes(img.link)
    );

    for (const image of imagesToDelete) {
      await deleteFile(image.link);
      await image.destroy({ transaction });
    }

    // Create or update the main image
    if (imageUploadResult.mainImage) {
      const mainImage = existingImages.find((img) => img.is_thumbnail);
      if (mainImage) {
        await mainImage.update(
          { link: imageUploadResult.mainImage },
          { transaction }
        );
      } else {
        const imageModel = await Image.create(
          {
            web_template: webTemplateModel.id,
            link: imageUploadResult.mainImage,
            is_thumbnail: true,
          },
          { transaction }
        );
        webTemplateModel = await webTemplateModel.update(
          { image: imageModel.id },
          { transaction }
        );
      }
    }

    // Create additional images
    const newAdditionalImages = imageUploadResult.additionalImages.filter(
      (imagePath) =>
        !existingImages.some((img) => img.link === imagePath)
    );

    if (newAdditionalImages.length > 0) {
      await Image.bulkCreate(
        newAdditionalImages.map((imagePath) => ({
          web_template: webTemplateModel.id,
          link: imagePath,
          is_thumbnail: false,
        })),
        { transaction }
      );
    }

    // Find existing events
    const criteria = {
      where: {
        id: events,
      },
    };
    const eventModels = await Event.findAll(criteria, { transaction });

    // Find or create event-template relationships
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

      if (!existEventForWebTemplate)
        await WebTemplateEvent.create(
          {
            event: event.id,
            web_template: webTemplateModel.id,
          },
          { transaction }
        );
    }

    // Delete event-template relationships that are no longer used
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

    // Finalize operations
    await transaction.commit();

    // Find events related to the template
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

    // Configure fields in the response
    const allImages = await Image.findAll({
      where: { web_template: webTemplateModel.id },
    });

    webTemplateModel.setDataValue(
      "images",
      allImages.map((img) => ({
        id: img.id,
        url: getUrlPublicFile(img.link),
        is_thumbnail: img.is_thumbnail,
      }))
    );
    webTemplateModel.setDataValue(
      "WebTemplateEvents",
      webTemplateEventModels || []
    );

    // Respond
    res.status(200).json({
      status: "OK",
      data: webTemplateModel,
    });
  } catch (error) {
    if (
      transaction &&
      (!transaction?.finished || transaction?.finished !== "commit")
    )
      await transaction.rollback();

    if (back?.imageUploadResult) {
      const { mainImage, additionalImages } = back.imageUploadResult;
      if (mainImage) await deleteFile(mainImage);
      for (const additionalImage of additionalImages) {
        await deleteFile(additionalImage);
      }
    }

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
  let transaction;
  try {
    // Validate parameters
    await validatorId(req);

    transaction = await Database.transaction();

    // Find the template by ID
    const webTemplateModel = await WebTemplate.findByPk(req.params.id, {
      transaction,
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    // Find images associated with the template
    const associatedImages = await Image.findAll({
      where: { web_template: webTemplateModel.id },
      transaction,
    });

    // Delete physical files of associated images
    for (const image of associatedImages) {
      await deleteFile(image.link);
    }

    // Delete image records from the database
    await Image.destroy({
      where: { web_template: webTemplateModel.id },
      transaction,
    });

    // Delete the template
    await webTemplateModel.destroy({ transaction });

    await transaction.commit();

    // Respond with success
    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    if (
      transaction &&
      (!transaction?.finished || transaction?.finished !== "commit")
    )
      await transaction.rollback();

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
