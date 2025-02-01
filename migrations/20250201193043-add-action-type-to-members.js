"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Menambahkan kolom action_type dengan default "I" dan tidak boleh NULL
    await queryInterface.addColumn("members", "action_type", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "I", // Default value untuk data baru
    });

    // Update data yang sudah ada untuk mengisi action_type dengan "I"
    await queryInterface.sequelize.query(
      `UPDATE "members" SET action_type = 'I' WHERE action_type IS NULL`
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("members", "action_type");
  },
};
