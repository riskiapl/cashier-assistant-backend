const { members, pending_members, otps } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../config/mailer");
const { Op } = require("sequelize");
const { otpMail } = require("../config/helper");

async function registerMember(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("Username, email, and password cannot be empty");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if email or username is already registered
  const existingUser = await members.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email is already registered");
    } else {
      throw new Error(
        "Username is already taken, please choose another username"
      );
    }
  }

  const existingPendingUsername = await pending_members.findOne({
    where: { username, email: { [Op.ne]: email } },
  });

  if (existingPendingUsername) {
    throw new Error(
      "Username is already registered, please use another username"
    );
  }

  // Generate and send OTP
  await generateAndSendOtp(email);

  // Check if email is already in pending_members table
  const existingPendingUser = await pending_members.findOne({
    where: { email },
  });

  if (existingPendingUser) {
    await existingPendingUser.update({
      username,
      password: hashedPassword,
      plain_password: password,
      updated_at: new Date(),
    });
    const updatedUser = existingPendingUser.toJSON();
    return updatedUser;
  }

  const newUser = await pending_members.create({
    username,
    password: hashedPassword,
    plain_password: password,
    email,
  });
  const newUserJson = newUser.toJSON();
  return newUserJson;
}

async function generateAndSendOtp(email) {
  const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

  // Check if email already has an OTP
  const existingOtp = await otps.findOne({
    where: { email },
    order: [["id", "DESC"]],
  });

  if (existingOtp) {
    await existingOtp.update({
      otp_code: otpCode,
      expires_at: expiresAt,
      is_verified: false,
      updated_at: new Date(),
    });
  } else {
    await otps.create({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_verified: false,
    });
  }

  // Send OTP to email
  const emailSubject = "Your OTP Code";
  const emailBody = otpMail(otpCode, "15 minutes");

  await sendMail(email, emailSubject, emailBody);
}

async function resendOtp(email) {
  const existingOtp = await otps.findOne({
    where: { email },
    order: [["id", "DESC"]],
  });

  if (!existingOtp) {
    throw new Error("Email not found, please register first");
  }

  const pendingMember = await pending_members.findOne({
    where: { email },
  });

  if (!pendingMember) {
    await existingOtp.destroy();
    throw new Error(
      "Email not found in pending members, please register first"
    );
  }

  const currentTime = new Date();

  if (currentTime < new Date(existingOtp.expires_at)) {
    throw new Error("OTP is still valid, please check your email");
  }

  await generateAndSendOtp(email);
  return { message: "A new OTP has been sent to your email" };
}

async function loginMember(userormail, password) {
  const member = await members.findOne({
    where: {
      [Op.or]: [{ username: userormail }, { email: userormail }],
      action_type: { [Op.ne]: "D" },
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const isMatch = await bcrypt.compare(password, member.password);

  if (!isMatch) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    {
      id: member.id,
      username: member.username,
      email: member.email,
      status: member.status,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return token;
}

async function verifyOtp(email, otpCode) {
  const otpEntry = await otps.findOne({ where: { email, otp_code: otpCode } });

  if (!otpEntry) {
    throw new Error("OTP not found or incorrect");
  }

  if (otpEntry.is_verified) {
    throw new Error("OTP has already been used");
  }

  const pendingMember = await pending_members.findOne({
    where: { email },
    order: [["id", "DESC"]],
  });

  if (!pendingMember) {
    throw new Error("Pending member not found");
  }

  const currentTime = new Date();
  if (currentTime > new Date(otpEntry.expires_at)) {
    throw new Error("OTP has expired");
  }

  await otpEntry.update({ is_verified: true, updated_at: new Date() });

  await members.create({
    username: pendingMember.username,
    password: pendingMember.password,
    plain_password: pendingMember.plain_password,
    email: pendingMember.email,
  });

  await pending_members.destroy({ where: { email } });

  return { message: "OTP successfully verified" };
}

async function isUsernameTaken(username) {
  console.log(username, "masuk username ===============");
  const existingUser = await members.findOne({
    where: { username },
  });

  if (existingUser) {
    return true;
  }

  const existingPendingUser = await pending_members.findOne({
    where: { username },
  });

  return !!existingPendingUser;
}

module.exports = {
  registerMember,
  loginMember,
  verifyOtp,
  resendOtp,
  isUsernameTaken,
};
