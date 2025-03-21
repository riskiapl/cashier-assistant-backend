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
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    plain_password: {
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
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "member"
    }
  }, {
    sequelize,
    tableName: 'members',
    schema: 'public',
    timestamps: true,
    createdAt: 'created_at', updatedAt: 'updated_at', indexes: [
      {
        name: "members_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
