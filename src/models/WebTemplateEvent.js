"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const WebTemplateEvent = sequelize.define(
    "WebTemplateEvent",
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
      event: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: "web_template_event",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  WebTemplateEvent.associate = (models) => {
    WebTemplateEvent.belongsTo(models.WebTemplate, {
      foreignKey: "web_template",
    });
    WebTemplateEvent.belongsTo(models.Event, {
      foreignKey: "event",
    });
  };

  return WebTemplateEvent;
};

module.exports = model;
