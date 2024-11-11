"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const WebTemplate = sequelize.define(
    "WebTemplate",
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
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      image: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "web_template",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  WebTemplate.associate = (models) => {
    WebTemplate.hasMany(models.WebTemplateEvent, {
      foreignKey: "web_template",
    });

    // Relation with many images (all images related to this WebTemplate)
    WebTemplate.hasMany(models.Image, {
      foreignKey: "web_template",
      as: "Images", // Alias for the relation
    });

    // Relation for the main image or thumbnail
    WebTemplate.belongsTo(models.Image, {
      foreignKey: "image",
      as: "ThumbnailImage", // Alias for the relation
    });
  };

  return WebTemplate;
};

module.exports = model;
