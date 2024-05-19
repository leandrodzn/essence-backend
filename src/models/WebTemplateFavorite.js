"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const WebTemplateFavorite = sequelize.define(
    "WebTemplateFavorite",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      web_template: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      customer: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: "web_template_favorite",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  WebTemplateFavorite.associate = (models) => {
    WebTemplateFavorite.belongsTo(models.WebTemplate, {
      foreignKey: "web_template",
    });
    WebTemplateFavorite.belongsTo(models.Customer, {
      foreignKey: "customer",
    });
  };

  return WebTemplateFavorite;
};

module.exports = model;
