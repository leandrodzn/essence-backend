"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorCreateTemplateContact = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      let schemaToValidate = {
        subject: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "subject"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "subject"
            ),
          },
          isLength: {
            options: { max: 255 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "subject"
            ),
          },
        },
        description: {
          in: ["body"],
          optional: {
            options: { nullable: true },
          },
          isString: {
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

module.exports = validatorCreateTemplateContact;
