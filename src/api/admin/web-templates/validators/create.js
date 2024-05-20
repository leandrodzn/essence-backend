"use strict";

const { check, checkSchema, validationResult } = require("express-validator");
const constants = require("../../../../utils/constants");

const validatorCreateWebTemplate = async (req, isUpdate) => {
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
              "title"
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
          isLength: {
            options: { max: 1000 },
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "description"
            ),
          },
        },
        price: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "price"
            ),
          },
          isFloat: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "price"
            ),
          },
        },
        link: {
          in: ["body"],
          notEmpty: {
            errorMessage: constants.errors.field_required.replace(
              ":name",
              "link"
            ),
          },
          isString: {
            errorMessage: constants.errors.field_invalid_format.replace(
              ":name",
              "link"
            ),
          },
        },
        events: {
          in: ["body"],
          // isArray: {
          //   options: { min: 1 },
          //   errorMessage: constants.errors.field_invalid_format.replace(
          //     ":name",
          //     "events"
          //   ),
          // },
          custom: {
            options: (value, { req }) => {
              if (!Array.isArray(value)) value = [value];

              if (value.length === 0)
                throw new Error(
                  "The 'events' array must contain at least one event id."
                );

              for (let i = 0; i < value.length; i++) {
                value[i] = parseInt(value[i], 10); // Convertir cada valor a entero
                if (isNaN(value[i])) {
                  console.log(value[i]);
                  throw new Error(
                    "The 'events' array must contain only integer values."
                  );
                }
              }
              req.body.events = value; // Asegurar que req.body.events sea el array modificado
              return true;
            },
            // options: (value) => {
            //   // if (!Array.isArray(value) || value.length === 0) {
            //   //   throw new Error(
            //   //     "The 'events' array must contain at least one event id."
            //   //   );
            //   // }
            //   // for (let i = 0; i < value.length; i++) {
            //   //   value[i] = parseInt(value[i], 10);
            //   //   if (isNaN(value[i])) {
            //   //     throw new Error(
            //   //       "The 'events' array must contain at least one event id and all items must be integer."
            //   //     );
            //   //   }
            //   // }
            //   // return true;
            //   if (!Array.isArray(value)) value = [value];

            //   if (value.length === 0) return false;

            //   for (let option of value) {
            //     option = parseInt(option, 10);
            //     if (typeof option !== "number") {
            //       return false;
            //     }
            //   }
            //   return true;
            // },
            errorMessage:
              "The 'events' array must contain at least one event id and all items must be integer.",
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

module.exports = validatorCreateWebTemplate;
