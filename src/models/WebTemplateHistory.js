"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const WebTemplateHistory = sequelize.define(
    "WebTemplateHistory",
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
      price_day: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "web_template_history",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  WebTemplateHistory.associate = (models) => {
    WebTemplateHistory.belongsTo(models.WebTemplate, {
      foreignKey: "web_template",
      paranoid: false, // Include soft deleted records
    });
    WebTemplateHistory.belongsTo(models.Customer, {
      foreignKey: "customer",
    });
  };

  return WebTemplateHistory;
};

module.exports = model;
