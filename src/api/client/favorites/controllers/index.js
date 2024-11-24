const {
  WebTemplate,
  Sequelize,
  WebTemplateFavorite,
  Image,
} = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorGetWebTemplatesFavorites } = require("../validators");
const { getUrlPublicFile } = require("../../../../utils/storage-helper");
const { Op } = require("sequelize");

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
          attributes: ["id", "name", "price", "description", "link"],
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

    if (sorting && sorting.created_at) {
      criteria.order = [["created_at", sorting.created_at]];
    }

    if (filter && filter.event) {
      criteria.include[0].where.id = {
        [Op.in]: Sequelize.safeLiteral(
          "(SELECT web_template_event.web_template FROM web_template_event WHERE web_template_event.event = ?)",
          [filter.event]
        ),
      };
    }

    const webTemplateFavoriteModels = await WebTemplateFavorite.findAndCountAll(
      criteria
    );

    (webTemplateFavoriteModels?.rows || []).forEach((webTemplateFavorite) => {
      if (webTemplateFavorite.WebTemplate?.ThumbnailImage?.link)
        webTemplateFavorite.WebTemplate.ThumbnailImage.setDataValue(
          "link",
          getUrlPublicFile(webTemplateFavorite.WebTemplate.ThumbnailImage.link)
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
