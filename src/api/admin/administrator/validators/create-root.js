"use strict";

const { checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorCreateRootAdministrator = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const schemaToValidate = {
        code: {
          notEmpty: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "code"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "code"
            ),
          },
          equals: {
            options: [process.env.EC_INITIAL_ADMIN_CODE],
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

module.exports = validatorCreateRootAdministrator;
