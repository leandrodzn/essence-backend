"use strict";

const { DataTypes, Model, Sequelize } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const Image = sequelize.define(
    "Image",
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
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_thumbnail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "image",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Image.associate = (models) => {
    Image.belongsTo(models.WebTemplate, {
      foreignKey: "web_template",
    });
  };

  return Image;
};

module.exports = model;
