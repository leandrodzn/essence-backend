const {
  WebTemplate,
  WebTemplateEvent,
  Event,
  Sequelize,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorGetWebTemplates } = require("../validators");
const { getUrlPublicFile } = require("../../../../utils/storage-helper");

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
      attributes: ["id", "name", "price", "description", "link", "image"],
    };

    if (sorting && sorting.created_at) {
      criteria.order = [["created_at", sorting.created_at]];
    }

    if (filter && filter.event) {
      criteria.where.id = {
        $in: Sequelize.safeLiteral(
          "(SELECT web_template_event.web_template FROM web_template_event WHERE web_template_event.event = ?)",
          [filter.event]
        ),
      };
    }

    const webTemplates = await WebTemplate.findAndCountAll(criteria);

    (webTemplates?.rows || []).forEach((webTemplate) => {
      if (webTemplate?.image)
        webTemplate.setDataValue("image", getUrlPublicFile(webTemplate.image));
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

module.exports = {
  getAllWebTemplates,
};
