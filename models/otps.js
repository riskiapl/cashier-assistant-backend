const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('otps', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'otps',
    schema: 'public',
    timestamps: true,
    createdAt: 'created_at', updatedAt: 'updated_at', indexes: [
      {
        name: "otps_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
