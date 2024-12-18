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
        type: DataTypes.DECIMAL(13, 2), // 13 digits in total, 2 after the decimal point
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
      readed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      show_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      show_customer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
