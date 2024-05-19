const {
  WebTemplate,
  WebTemplateEvent,
  Event,
  Sequelize,
  WebTemplateFavorite,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorGetWebTemplatesFavorites } = require("../validators");
const { getUrlPublicFile } = require("../../../../utils/storage-helper");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const getAllWebTemplatesFavorites = async (req, res) => {
  try {
    await validatorGetWebTemplatesFavorites(req);

    const { page, count, filter, sorting } = req.query;

    let criteria = {
      where: {
        customer: req.currentUser.id,
      },
      attributes: ["id"],
      include: [
        {
          model: WebTemplate,
          where: {},
          attributes: ["id", "name", "price", "description", "link", "image"],
        },
      ],
    };

    if (sorting && sorting.created_at) {
      criteria.order = [["created_at", sorting.created_at]];
    }

    if (filter && filter.event) {
      criteria.include[0].where.id = {
        $in: Sequelize.safeLiteral(
          "(SELECT web_template_event.web_template FROM web_template_event WHERE web_template_event.event = ?)",
          [filter.event]
        ),
      };
    }

    const webTemplateFavoriteModels = await WebTemplateFavorite.findAndCountAll(
      criteria
    );

    (webTemplateFavoriteModels?.rows || []).forEach((webTemplateFavorite) => {
      if (webTemplateFavorite.WebTemplate?.image)
        webTemplateFavorite.WebTemplate.setDataValue(
          "image",
          getUrlPublicFile(webTemplateFavorite.WebTemplate.image)
        );
    });

    res.status(200).json({
      status: "OK",
      data: webTemplateFavoriteModels,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  getAllWebTemplatesFavorites,
};
