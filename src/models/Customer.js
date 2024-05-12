"use strict";

const { DataTypes, Model } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
const model = (sequelize) => {
  const Customer = sequelize.define(
    "Customer",
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
      surname: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      confirmation_token: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      reset_password_token: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "customer",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Customer.associate = (models) => {};

  return Customer;
};

module.exports = model;
