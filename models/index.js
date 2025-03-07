"use strict";

const Sequelize = require("sequelize");
const process = require("process");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const initModels = require("./init-models"); // Import initModels dari sequelize-auto
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Inisialisasi model dari initModels
const models = initModels(sequelize);
Object.assign(db, models); // Gabungkan semua model ke dalam db object

// Handle associations secara manual jika ada
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Ekspor sequelize instance dan model
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
