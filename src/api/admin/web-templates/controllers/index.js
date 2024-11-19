const {
  Event,
  WebTemplate,
  WebTemplateEvent,
  Image,
} = require("../../../../models");
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

    if (!imageUploadResult?.mainImage) {
      throw new CustomError({
        status: 400,
        name: "BadRequest",
        message: constants.response.IMAGE_REQUIRED,
      });
    }

    if (!imageUploadResult?.additionalImages?.length == 2) {
      throw new CustomError({
        status: 400,
        name: "BadRequest",
        message: constants.response.IMAGES_REQUIRED,
      });
    }

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
        price,
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

    if (
      imageUploadResult?.additionalImages?.length &&
      imageUploadResult?.additionalImages?.length !== 2
    ) {
      throw new CustomError({
        status: 400,
        name: "BadRequest",
        message: constants.response.IMAGES_REQUIRED,
      });
    }

    // Validate parameters
    await validatorId(req);

    // Validate the data sent from the client
    await validatorCreateWebTemplate(req, true);

    transaction = await Database.transaction();

    const { name, link, description, price, events } = req.body;

    // Find the existing record
    let webTemplateModel = await WebTemplate.findOne(
      {
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Image,
            as: "ThumbnailImage",
            attributes: ["id", "link"],
            required: false,
          },
          {
            model: Image,
            as: "Images",
            required: true,
            attributes: ["id", "link"],
            where: {
              is_thumbnail: false,
            },
          },
        ],
      },
      {
        transaction,
      }
    );

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

    // Update images
    if (imageUploadResult?.mainImage) {
      // Create new thumbnail image
      const newThumbnailImageModel = await Image.create(
        {
          link: imageUploadResult.mainImage,
          web_template: webTemplateModel.id,
          is_thumbnail: true,
        },
        {
          transaction,
        }
      );

      const oldThumbnailImageModel = webTemplateModel.ThumbnailImage; // Old thumbnail image

      // Update the web template to use the new thumbnail image
      webTemplateModel = await webTemplateModel.update(
        {
          image: newThumbnailImageModel.id,
        },
        { transaction }
      );

      // Delete the old thumbnail image
      await Image.destroy({
        where: {
          id: oldThumbnailImageModel.id,
        },
        transaction,
      });

      await deleteFile(oldThumbnailImageModel.link); // Delete the old thumbnail image file
    }

    // Create additional images
    if (imageUploadResult?.additionalImages?.length) {
      // Create new additional images
      const newAdditionalImagesModels = await Image.bulkCreate(
        imageUploadResult.additionalImages.map((image) => {
          return {
            is_thumbnail: false,
            web_template: webTemplateModel.id,
            link: image,
          };
        }),
        { transaction }
      );

      const oldAdditionalImages = webTemplateModel.Images; // Old additional images

      // Delete the old additional images
      await Image.destroy({
        where: {
          id: oldAdditionalImages.map((image) => image.id),
          web_template: webTemplateModel.id,
        },
        transaction,
      });

      // Delete the old additional image files
      for (const oldImage of oldAdditionalImages) {
        await deleteFile(oldImage.link);
      }
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
      include: [
        {
          model: Image,
          as: "ThumbnailImage",
          attributes: ["link"],
          required: false,
        },
      ],
    };

    const webTemplates = await WebTemplate.findAll(criteria);

    webTemplates.forEach((webTemplate) => {
      if (webTemplate?.ThumbnailImage?.link)
        webTemplate.ThumbnailImage.setDataValue(
          "link",
          getUrlPublicFile(webTemplate.ThumbnailImage.link)
        );
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
      attributes: ["id", "name", "price", "description", "link"],
      include: [
        {
          model: Image,
          as: "ThumbnailImage",
          attributes: ["link"],
          required: false,
        },
        {
          model: Image,
          as: "Images",
          attributes: ["link"],
          where: {
            is_thumbnail: false,
          },
          required: false,
        },
        {
          model: WebTemplateEvent,
          attributes: ["event"],
          include: [
            {
              model: Event,
              attributes: ["name"],
              required: true,
            },
          ],
        },
      ],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    if (webTemplateModel?.ThumbnailImage?.link)
      webTemplateModel.ThumbnailImage.setDataValue(
        "link",
        getUrlPublicFile(webTemplateModel.ThumbnailImage.link)
      );

    if (webTemplateModel?.Images?.length) {
      webTemplateModel?.Images.forEach((image) => {
        image.setDataValue("link", getUrlPublicFile(image.link));
      });
    }

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
    let webTemplateModel = await WebTemplate.findByPk(req.params.id, {
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

    // Update the template to remove the image
    webTemplateModel = await webTemplateModel.update(
      {
        image: null,
      },
      { transaction }
    );

    // Delete image records from the database
    await Image.destroy({
      where: { web_template: webTemplateModel.id },
      transaction,
    });

    // Delete the template
    await webTemplateModel.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Delete physical files of associated images
    for (const image of associatedImages) {
      await deleteFile(image.link);
    }

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
