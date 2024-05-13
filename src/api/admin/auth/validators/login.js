"use strict";

const { checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorLogin = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkSchema({
        email: {
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "email"
            ),
          },
          isLength: {
            options: { max: 255 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "email"
            ),
          },
          isEmail: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "email"
            ),
          },
        },
        password: {
          notEmpty: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "password"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "password"
            ),
          },
        },
      }).run(req);

      const validation = validationResult(req);

      if (validation.errors.length != 0)
        throw new CustomError({
          status: 400,
          name: constants.response.INVALID_BODY_FIELDS,
          message: "general_invalid_fields",
          errors: validation.errors,
        });

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = validatorLogin;
