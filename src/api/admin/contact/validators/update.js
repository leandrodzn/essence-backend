"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorUpdateWebTemplateHistory = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await check(
        "id",
        constants.errors.field_invalid_format.replace(":name", "id")
      )
        .isInt()
        .run(req);

      let schemaToValidate = {
        readed: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "readed"
            ),
          },
          isBoolean: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "readed"
            ),
          },
        },
      };

      await checkSchema(schemaToValidate).run(req);

      const validation = validationResult(req);

      if (validation.errors.length != 0) {
        throw new CustomError({
          status: 400,
          name: constants.response.INVALID_BODY_FIELDS,
          message: "general_invalid_fields",
          errors: validation.errors,
        });
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = validatorUpdateWebTemplateHistory;
