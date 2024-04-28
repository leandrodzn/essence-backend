"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("./constants");

const validatorId = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await check(
        "id",
        constants.errors.field_invalid_format.replace(":name", "id")
      )
        .notEmpty()
        .isInt()
        .run(req);

      const validation = validationResult(req);

      if (!validation.isEmpty()) {
        throw new CustomError({
          status: 400,
          name: constants.response.INVALID_PARAMS_FIELD,
          message: "invalid_param_field",
          errors: validation.errors,
        });
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  validatorId,
};
