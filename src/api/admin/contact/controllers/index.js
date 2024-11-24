const {
  WebTemplate,
  Sequelize,
  WebTemplateHistory,
  Customer,
  Image,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const {
  getUrlPublicFile,
  fileExists,
} = require("../../../../utils/storage-helper");
const { validatorId } = require("../../../../utils/validators");
const Database = require("../../../../config/database");
const { validatorUpdateWebTemplateHistory } = require("../validators");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const updateReadedWebTemplateContactById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    await validatorUpdateWebTemplateHistory(req);

    const webTemplateContactModel = await WebTemplateHistory.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "readed"],
    });

    if (!webTemplateContactModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_CONTACT_NOT_FOUND,
      });

    const { readed } = req.body;

    await webTemplateContactModel.update({
      readed: readed,
    });

    res.status(200).json({
      status: "OK",
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
const getAllWebTemplateContacts = async (req, res) => {
  try {
    const { count, page, filter, sorting } = req.query;

    let criteria = {
      where: {
        show_admin: true,
      },
      attributes: [
        "id",
        "price_day",
        "created_at",
        "readed",
        "web_template",
        "show_customer",
      ],
      order: [
        ["readed", "DESC"],
        ["created_at", "DESC"],
      ],
      include: [
        {
          model: WebTemplate,
          attributes: ["id", "name", "price"],
          required: true,
          paranoid: false,
          include: [
            {
              model: Image,
              as: "ThumbnailImage",
              attributes: ["link"],
              required: false,
            },
          ],
        },
        {
          model: Customer,
          attributes: ["name", "surname"],
          required: true,
        },
      ],
    };

    // Filters
    if (filter) {
      const { readed } = filter;

      if (readed) {
        criteria.where.readed = readed;
      }
    }

    // Sorting
    if (sorting) {
      const { created_at, readed } = sorting;

      if (created_at) {
        criteria.order = [["created_at", created_at]];
      }

      if (readed) {
        criteria.order = [["readed", readed]];
      }
    }

    // Query
    const contactHistoryModels = await WebTemplateHistory.findAndCountAll(
      criteria
    );

    for (const contactHistory of contactHistoryModels.rows) {
      // Check template available
      const existsTemplate = await WebTemplate.findByPk(
        contactHistory.web_template
      );
      contactHistory.setDataValue(
        "template_available",
        existsTemplate ? true : false
      );

      // Template main image
      if (contactHistory.WebTemplate?.ThumbnailImage?.link) {
        const existsImage = await fileExists(
          contactHistory.WebTemplate.ThumbnailImage.link
        );

        contactHistory.WebTemplate.ThumbnailImage.setDataValue(
          "link",
          existsImage
            ? getUrlPublicFile(contactHistory.WebTemplate.ThumbnailImage.link)
            : null
        );
      }
    }

    res.status(200).json({
      status: "OK",
      data: contactHistoryModels,
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
const getOneWebTemplateContactById = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    let criteria = {
      where: {
        id: req.params.id,
        show_admin: true,
      },
      attributes: [
        "id",
        "price_day",
        "created_at",
        "readed",
        "web_template",
        "show_customer",
        "subject",
        "description",
      ],
      include: [
        {
          model: WebTemplate,
          attributes: ["id", "name", "price", "description"],
          required: true,
          paranoid: false,
          include: [
            {
              model: Image,
              as: "ThumbnailImage",
              attributes: ["link"],
              required: false,
            },
          ],
        },
        {
          model: Customer,
          attributes: ["name", "surname", "email", "phone"],
          required: true,
        },
      ],
    };

    const contactHistoryModel = await WebTemplateHistory.findOne(criteria);

    if (!contactHistoryModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_CONTACT_NOT_FOUND,
      });

    // Check template available
    const existsTemplate = await WebTemplate.findByPk(
      contactHistoryModel.web_template
    );
    contactHistoryModel.setDataValue(
      "template_available",
      existsTemplate ? true : false
    );

    // Template main image
    if (contactHistoryModel.WebTemplate?.ThumbnailImage?.link) {
      const existsImage = await fileExists(
        contactHistoryModel.WebTemplate.ThumbnailImage.link
      );

      contactHistoryModel.WebTemplate.ThumbnailImage.setDataValue(
        "link",
        existsImage
          ? getUrlPublicFile(
              contactHistoryModel.WebTemplate.ThumbnailImage.link
            )
          : null
      );
    }

    res.status(200).json({
      status: "OK",
      data: contactHistoryModel,
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
const deleteTemplateContactById = async (req, res) => {
  let transaction;
  try {
    // Validate params
    await validatorId(req);

    const templateContactModel = await WebTemplateHistory.findByPk(
      req.params.id,
      {
        where: {
          show_admin: true,
        },
      }
    );

    if (!templateContactModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_CONTACT_NOT_FOUND,
      });

    transaction = await Database.transaction();

    await templateContactModel.update(
      {
        show_admin: false,
      },
      { transaction }
    );

    if (!templateContactModel.show_customer)
      await templateContactModel.destroy({ transaction });

    await transaction.commit();

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
  updateReadedWebTemplateContactById,
  getAllWebTemplateContacts,
  getOneWebTemplateContactById,
  deleteTemplateContactById,
};
