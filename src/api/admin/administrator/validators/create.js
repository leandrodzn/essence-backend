"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorCreateAdministrator = async (req, isUpdate) => {
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
              "name"
            ),
          },
          isLength: {
            options: { max: 255 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "name"
            ),
          },
        },
        surname: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "surname"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "surname"
            ),
          },
          isLength: {
            options: { max: 255 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "surname"
            ),
          },
        },
        email: {
          in: ["body"],
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
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
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
          isLength: {
            options: { max: 50 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "password"
            ),
          },
          isStrongPassword: {
            options: {
              minLength: 8,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
              returnScore: false,
            },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "password"
            ),
          },
        },
      };

      if (isUpdate) {
        schemaToValidate.password.optional = true;
        delete schemaToValidate.password.notEmpty;
      }

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

module.exports = validatorCreateAdministrator;
