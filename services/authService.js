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

  // Check if email is already registered
  const existingEmail = await members.findOne({ where: { email } });

  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  // Check if username is already registered
  const existingUsername = await members.findOne({ where: { username } });

  if (existingUsername) {
    throw new Error(
      "Username is already registered, please use another username"
    );
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
    delete updatedUser.password;
    delete updatedUser.plain_password;
    return updatedUser;
  }

  const newUser = await pending_members.create({
    username,
    password: hashedPassword,
    plain_password: password,
    email,
  });
  const newUserJson = newUser.toJSON();
  delete newUserJson.password;
  delete newUserJson.plain_password;
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
    { id: member.id, username: member.username },
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

  const currentTime = new Date();
  if (currentTime > new Date(otpEntry.expires_at)) {
    throw new Error("OTP has expired");
  }

  await otpEntry.update({ is_verified: true, updated_at: new Date() });

  const pendingMember = await pending_members.findOne({
    where: { email },
    order: [["id", "DESC"]],
  });

  if (!pendingMember) {
    throw new Error("Pending member not found");
  }

  await members.create({
    username: pendingMember.username,
    password: pendingMember.password,
    plain_password: pendingMember.plain_password,
    email: pendingMember.email,
  });

  await pending_members.destroy({ where: { email } });

  return { message: "OTP successfully verified" };
}

module.exports = { registerMember, loginMember, verifyOtp, resendOtp };
