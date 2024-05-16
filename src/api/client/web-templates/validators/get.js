"use strict";

const { checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorGetWebTemplates = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkSchema({
        page: {
          optional: true,
          isInt: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "page"
            ),
          },
        },
        count: {
          optional: true,
          isInt: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "count"
            ),
          },
        },
        "sorting[created_at]": {
          optional: true,
          isIn: {
            options: [["asc", "desc"]],
            errorMessage: constants.errors.field_invalid_option.replace(
              ":name",
              "sorting.created_at"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "sorting.created_at"
            ),
          },
        },
        "filter[event]": {
          optional: true,
          isInt: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "filter.event"
            ),
          },
        },
      }).run(req);

      const validation = validationResult(req);

      if (validation.errors.length != 0) {
        throw new CustomError({
          message: req.i18n.t("errors.general_invalid_fields"),
          status: 400,
          errors: validation.errors,
        });
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = validatorGetWebTemplates;
