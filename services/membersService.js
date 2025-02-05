const { members } = require("../models");
const { Op } = require("sequelize");

async function updateMemberData(memberId, updateData) {
  try {
    const member = await members.findByPk(memberId);
    console.log(member, updateData, "masuk data");
    if (!member) {
      throw new Error("Member not found");
    }

    await member.update(updateData);
    return member;
  } catch (error) {
    throw error;
  }
}

async function updateMemberAvatar(memberId, avatarUrl) {
  try {
    const member = await members.findByPk(memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    member.avatar = avatarUrl;
    await member.save();
    return member;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  updateMemberData,
  updateMemberAvatar,
};
