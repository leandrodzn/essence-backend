const {
  WebTemplate,
  Sequelize,
  WebTemplateHistory,
  Image,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorCreateTemplateContact } = require("../validators");
const {
  getUrlPublicFile,
  fileExists,
} = require("../../../../utils/storage-helper");
const { validatorId } = require("../../../../utils/validators");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const createWebTemplateContact = async (req, res) => {
  try {
    // Validate params
    await validatorId(req);

    // Validate data
    await validatorCreateTemplateContact(req);

    const webTemplateModel = await WebTemplate.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "price"],
    });

    if (!webTemplateModel)
      throw new CustomError({
        status: 404,
        name: "NotFound",
        message: constants.response.WEB_TEMPLATE_NOT_FOUND,
      });

    const { subject, description } = req.body;

    let historyModel = await WebTemplateHistory.create({
      web_template: webTemplateModel.id,
      customer: req.currentUser.id,
      price_day: webTemplateModel.price,
      subject: subject,
      description: description,
      readed: false,
      show_customer: true,
      show_admin: true,
    });

    res.status(200).json({
      status: "OK",
      data: historyModel,
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
    const customer = req.currentUser.id;

    let criteria = {
      where: {
        customer: customer,
        show_customer: true,
      },
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "price_day",
        "web_template",
        "customer",
        "created_at",
        "readed",
        "show_admin",
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
      ],
    };

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

      // Template image
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
const deleteTemplateContactById = async (req, res) => {
  let transaction;
  try {
    // Validate params
    await validatorId(req);

    const templateContactModel = await WebTemplateHistory.findByPk(
      req.params.id,
      {
        where: {
          show_customer: true,
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
        show_customer: false,
      },
      { transaction }
    );

    if (!templateContactModel.show_admin)
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
  createWebTemplateContact,
  getAllWebTemplateContacts,
  deleteTemplateContactById,
};
