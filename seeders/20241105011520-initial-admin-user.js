"use strict";

require("dotenv").config();
const { hashPasswordAdministrator } = require("../src/config/auth");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Commands to seed database with initial data
     */
    try {
      const password = await hashPasswordAdministrator(
        process.env.EC_INITIAL_ADMIN_PASSWORD
      );
      // Define default user data
      const defaults = {
        name: process.env.EC_INITIAL_ADMIN_NAME,
        surname: process.env.EC_INITIAL_ADMIN_SURNAME,
        email: process.env.EC_INITIAL_ADMIN_MAIL,
        password: await hashPasswordAdministrator(
          process.env.EC_INITIAL_ADMIN_PASSWORD
        ),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Check if the user already exists
      let [administratorModel] = await queryInterface.sequelize.query(
        `SELECT id FROM \`administrator\` WHERE email = :email LIMIT 1`,
        {
          replacements: { email: defaults.email },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!administratorModel) {
        // Create the new user
        await queryInterface.bulkInsert("administrator", [defaults], {});
      }
    } catch (error) {
      throw error; // Re-throw the error
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     */
  },
};
