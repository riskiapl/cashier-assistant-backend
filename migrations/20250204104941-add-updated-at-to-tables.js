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

    // Menambahkan kolom updated_at ke tabel otps
    await queryInterface.addColumn("otps", "updated_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    });

    // Menambahkan kolom updated_at ke tabel pending_members
    await queryInterface.addColumn("pending_members", "updated_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Menghapus kolom updated_at dari tabel otps
    await queryInterface.removeColumn("otps", "updated_at");

    // Menghapus kolom updated_at dari tabel pending_members
    await queryInterface.removeColumn("pending_members", "updated_at");
  },
};
