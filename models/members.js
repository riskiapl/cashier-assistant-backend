const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('members', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "members_username_key"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    plain_password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    action_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "I"
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "NULL"
    }
  }, {
    sequelize,
    tableName: 'members',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "members_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "members_username_key",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
