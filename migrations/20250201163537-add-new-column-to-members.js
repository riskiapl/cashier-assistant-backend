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
    // 1. Tambahkan kolom 'email' dengan nilai default sementara
    await queryInterface.addColumn("members", "email", {
      type: Sequelize.STRING,
      allowNull: true, // Izinkan null sementara
      after: "username", // Menyisipkan kolom setelah kolom 'username'
      defaultValue: "default@example.com", // Nilai default sementara
    });

    // 2. Perbarui nilai 'email' untuk setiap baris (sesuaikan dengan kebutuhan Anda)
    // Contoh: Menggunakan email default atau nilai lain yang sesuai
    await queryInterface.sequelize.query(
      `UPDATE members SET email = CONCAT(username, '@gmail.com') WHERE email = 'default@example.com';`
    );

    // 3. Ubah kolom 'email' menjadi NOT NULL
    await queryInterface.changeColumn("members", "email", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("members", "email");
  },
};
