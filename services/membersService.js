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

async function updatePasswords(email, oldPassword, newPassword) {
  const member = await members.findOne({ where: { email } });

  if (!member) {
    throw new Error("Member not found");
  }

  // Check if old password matches
  const isPasswordValid = await bcrypt.compare(oldPassword, member.password);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await member.update({
    password: hashedPassword,
    plain_password: newPassword,
    updated_at: new Date(),
  });

  return { message: "Password has been successfully updated" };
}

async function getAllMembers() {
  const members = await members.findAll({
    where: { action_type: { [Op.ne]: "D" } },
  });
  return members;
}

async function getMembers(memberId) {
  const member = await members.findByPk(memberId, {
    where: { action_type: { [Op.ne]: "D" } },
  });
  return member;
}

module.exports = {
  updateMemberData,
  updateMemberAvatar,
  deleteMemberData,
  updatePasswords,
  getAllMembers,
  getMembers,
};
