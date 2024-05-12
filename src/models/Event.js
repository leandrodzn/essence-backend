"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const Event = sequelize.define(
    "Event",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "event",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Event.associate = (models) => {
    Event.hasMany(models.WebTemplateEvent, {
      foreignKey: "event",
    });
  };

  return Event;
};

module.exports = model;
