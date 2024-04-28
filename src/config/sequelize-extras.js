"use strict";

const Sequelize = require("sequelize");
const sqlString = require("sequelize/lib/sql-string");

Sequelize.safeLiteral = function (query, params) {
  if (query) {
    const variables = query.match(/\?/g);
    const valores = params && typeof params === "object" ? params : null;

    if (variables && variables.length && valores) {
      variables.forEach((variable, index) => {
        if (valores[index]) {
          query = query.replace(variable, sqlString.escape(valores[index]));
        }
      });
    }
  }

  return Sequelize.literal(query);
};
