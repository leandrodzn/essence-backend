"use strict";

module.exports = {
  response: {
    error: "ERROR",
    unknown_error: "UNKNOWN_ERROR",
    success: "OK",

    INVALID_REQUEST_FIELDS: "InvalidRequestFields",
    INVALID_BODY_FIELDS: "InvalidBodyFields",
    INVALID_PARAMS_FIELD: "InvalidParamsField",

    INVALID_AUTH_CREDENTIAL: "UnauthorizedError",
    EVENT_NOT_FOUND: "EventNotFound",
    WEB_TEMPLATE_NOT_FOUND: "WebTemplateNotFound",
  },
  errors: {
    field_required: "The field :name is required",
    field_invalid_format: "The field :name has an incorrect format",
    field_invalid_option: "The field :name is an option not allowed",
    general_invalid_fields: "Some fields are invalids",
    401: "Please verify yours credentials account",
  },
  status: {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  },
};
