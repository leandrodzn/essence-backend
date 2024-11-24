const {
  WebTemplate,
  WebTemplateEvent,
  Event,
  Sequelize,
  WebTemplateFavorite,
  Image,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorGetWebTemplates } = require("../validators");
const { getUrlPublicFile } = require("../../../../utils/storage-helper");
const { validatorId } = require("../../../../utils/validators");
const { Op } = require("sequelize");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getAllWebTemplates = async (req, res) => {
  try {
    await validatorGetWebTemplates(req);

    const { page, count, filter, sorting } = req.query;

    let criteria = {
      where: {},
      attributes: ["id", "name", "price", "description", "link"],
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Image,
          as: "ThumbnailImage",
          attributes: ["link"],
          required: false,
        },
      ],
    };

    if (sorting && sorting.created_at) {
      criteria.order = [["created_at", sorting.created_at]];
    }

    if (filter && filter.event) {
      criteria.where.id = {
        [Op.in]: Sequelize.safeLiteral(
          "(SELECT web_template_event.web_template FROM web_template_event WHERE web_template_event.event = ?)",
          [filter.event]
        ),
      };
    }

    const webTemplates = await WebTemplate.findAndCountAll(criteria);

    (webTemplates?.rows || []).forEach((webTemplate) => {
      if (webTemplate?.ThumbnailImage?.link)
        webTemplate.ThumbnailImage.setDataValue(
          "link",
          getUrlPublicFile(webTemplate.ThumbnailImage.link)
        );
    });

    for (const webTemplate of webTemplates?.rows || []) {
      const webTemplateEvents = await WebTemplateEvent.findAll({
        where: {
          web_template: webTemplate.id,
        },
        attributes: [],
        include: [
          {
            model: Event,
            required: true,
            attributes: ["name", "description"],
          },
        ],
      });

      webTemplate.setDataValue("WebTemplateEvents", webTemplateEvents);
    }

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

    const webTemplateEvents = await WebTemplateEvent.findAll({
      where: {
        web_template: webTemplateModel.id,
      },
      attributes: ["id"],
      include: [
        {
          model: Event,
          attributes: ["name", "description"],
        },
      ],
    });

    webTemplateModel.setDataValue("WebTemplateEvents", webTemplateEvents || []);

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
const getWebTemplateFavoriteById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const webTemplateModel = await WebTemplate.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id"],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    const favoriteModel = await WebTemplateFavorite.findOne({
      where: {
        web_template: webTemplateModel.id,
        customer: req.currentUser.id,
      },
      attributes: ["id"],
    });

    res.status(200).json({
      status: "OK",
      data: favoriteModel,
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
const createWebTemplateFavorite = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const webTemplateModel = await WebTemplate.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id"],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    let favoriteModel = await WebTemplateFavorite.findOne({
      where: {
        web_template: webTemplateModel.id,
        customer: req.currentUser.id,
      },
      attributes: ["id"],
    });

    if (!favoriteModel)
      favoriteModel = await WebTemplateFavorite.create({
        web_template: webTemplateModel.id,
        customer: req.currentUser.id,
      });

    res.status(200).json({
      status: "OK",
      data: favoriteModel,
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
const deleteWebTemplateFavorite = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    const webTemplateModel = await WebTemplate.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id"],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    const favoriteModel = await WebTemplateFavorite.findOne({
      where: {
        web_template: webTemplateModel.id,
        customer: req.currentUser.id,
      },
      attributes: ["id"],
    });

    if (favoriteModel) await favoriteModel.destroy();

    res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  getAllWebTemplates,
  getWebTemplateById,
  getWebTemplateFavoriteById,
  createWebTemplateFavorite,
  deleteWebTemplateFavorite,
};
