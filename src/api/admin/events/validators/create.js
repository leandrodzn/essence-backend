"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorCreateEvent = async (req, isUpdate) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isUpdate) {
        await check(
          "id",
          constants.errors.field_invalid_format.replace(":name", "id")
        )
          .isInt()
          .run(req);
      }

      let schemaToValidate = {
        name: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "name"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "title"
            ),
          },
          isLength: {
            options: { max: 255 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "title"
            ),
          },
        },
        description: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "description"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "description"
            ),
          },
          isLength: {
            options: { max: 500 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "description"
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

module.exports = validatorCreateEvent;
