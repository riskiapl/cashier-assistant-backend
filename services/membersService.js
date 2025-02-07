const { members } = require("../models");
const { Op } = require("sequelize");

async function updateMemberData(memberId, updateData) {
  try {
    const member = await members.findByPk(memberId);

    if (!member || member.action_type === "D") {
      throw new Error("Member not found");
    }

    await member.update({
      ...updateData,
      action_type: "U",
      updated_at: new Date(),
    });
    return member;
  } catch (error) {
    throw error;
  }
}

async function updateMemberAvatar(memberId, avatarUrl) {
  try {
    const member = await members.findByPk(memberId);
    if (!member || member.action_type === "D") {
      throw new Error("Member not found");
    }

    member.avatar = avatarUrl;
    member.action_type = "U";
    member.updated_at = new Date();
    await member.save();
    return member;
  } catch (error) {
    throw error;
  }
}

async function deleteMemberData(memberId) {
  try {
    const member = await members.findByPk(memberId);
    if (!member || member.action_type === "D") {
      throw new Error("Member not found");
    }

    member.action_type = "D";
    member.updated_at = new Date();
    await member.save();
    return member;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  updateMemberData,
  updateMemberAvatar,
  deleteMemberData,
};
