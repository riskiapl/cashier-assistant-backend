"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Change action_type to be a single character
      await queryInterface.changeColumn(
        "products",
        "action_type",
        {
          type: Sequelize.CHAR(1),
          allowNull: false,
          defaultValue: "I",
        },
        { transaction }
      );

      // Add stock column
      await queryInterface.addColumn(
        "products",
        "stock",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Revert action_type back to string(255)
      await queryInterface.changeColumn(
        "products",
        "action_type",
        {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "I",
        },
        { transaction }
      );

      // Remove stock column
      await queryInterface.removeColumn("products", "stock", { transaction });
    });
  },
};
