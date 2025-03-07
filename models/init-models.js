var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _members = require("./members");
var _otps = require("./otps");
var _pending_members = require("./pending_members");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var members = _members(sequelize, DataTypes);
  var otps = _otps(sequelize, DataTypes);
  var pending_members = _pending_members(sequelize, DataTypes);


  return {
    SequelizeMeta,
    members,
    otps,
    pending_members,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
