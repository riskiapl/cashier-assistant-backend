const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../config/mailer");
const { otpMail } = require("../config/helper");

async function registerMember(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("Username, email, and password cannot be empty");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if email is already registered
  const existingEmailQuery = "SELECT * FROM members WHERE email = $1";
  const existingEmailResult = await pool.query(existingEmailQuery, [email]);

  if (existingEmailResult.rows.length > 0) {
    throw new Error("Email is already registered");
  }

  // Check if username is already registered
  const existingUsernameQuery = "SELECT * FROM members WHERE username = $1";
  const existingUsernameResult = await pool.query(existingUsernameQuery, [
    username,
  ]);

  if (existingUsernameResult.rows.length > 0) {
    throw new Error(
      "Username is already registered, please use another username"
    );
  }

  const existingPendingUsernameQuery =
    "SELECT * FROM pending_members WHERE username = $1 AND email != $2";
  const existingPendingUsernameResult = await pool.query(
    existingPendingUsernameQuery,
    [username, email]
  );

  if (existingPendingUsernameResult.rows.length > 0) {
    throw new Error(
      "Username is already registered, please use another username"
    );
  }

  // Generate and send OTP
  await generateAndSendOtp(email);

  // Add user to pending_members table
  // Check if email is already in pending_members table
  const existingPendingUserQuery =
    "SELECT * FROM pending_members WHERE email = $1";
  const existingPendingUserResult = await pool.query(existingPendingUserQuery, [
    email,
  ]);

  if (existingPendingUserResult.rows.length > 0) {
    const updatePendingUserQuery = `
      UPDATE pending_members
      SET username = $1, password = $2, plain_password = $3, email = $4, updatedAt = NOW()
      WHERE username = $1 OR email = $4
      RETURNING *`;
    const updatePendingUserValues = [username, hashedPassword, password, email];
    const updateResult = await pool.query(
      updatePendingUserQuery,
      updatePendingUserValues
    );
    const updatedUser = updateResult.rows[0];
    delete updatedUser.password;
    delete updatedUser.plain_password;
    return updatedUser;
  }

  const query =
    "INSERT INTO pending_members (username, password, plain_password, email) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [username, hashedPassword, password, email];

  const result = await pool.query(query, values);
  const newUser = result.rows[0];
  delete newUser.password;
  delete newUser.plain_password;
  return newUser;
}

async function generateAndSendOtp(email) {
  const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

  // Check if email already has an OTP
  const existingOtpQuery =
    "SELECT * FROM otps WHERE email = $1 ORDER BY id DESC LIMIT 1";
  const existingOtpResult = await pool.query(existingOtpQuery, [email]);

  if (existingOtpResult.rows.length > 0) {
    const updateOtpQuery = `
      UPDATE otps
      SET otp_code = $1, expires_at = $2, is_verified = $3, updatedAt = NOW()
      WHERE email = $4
    `;
    const updateOtpValues = [otpCode, expiresAt, false, email];
    await pool.query(updateOtpQuery, updateOtpValues);
  } else {
    const otpQuery =
      "INSERT INTO otps (email, otp_code, expires_at, is_verified) VALUES ($1, $2, $3, $4)";
    const otpValues = [email, otpCode, expiresAt, false];
    await pool.query(otpQuery, otpValues);
  }

  // Send OTP to email
  const emailSubject = "Your OTP Code";
  const emailBody = otpMail(otpCode, "15 minutes");

  await sendMail(email, emailSubject, emailBody);
}

async function resendOtp(email) {
  const existingOtpQuery =
    "SELECT * FROM otps WHERE email = $1 ORDER BY id DESC LIMIT 1";
  const existingOtpResult = await pool.query(existingOtpQuery, [email]);

  if (existingOtpResult.rows.length === 0) {
    throw new Error("Email not found, please register first");
  }

  const otpEntry = existingOtpResult.rows[0];
  const currentTime = new Date();

  if (currentTime < new Date(otpEntry.expires_at)) {
    throw new Error("OTP is still valid, please check your email");
  }

  await generateAndSendOtp(email);
  return { message: "A new OTP has been sent to your email" };
}

async function loginMember(userormail, password) {
  const query = "SELECT * FROM members WHERE username = $1 OR email = $1";
  const result = await pool.query(query, [userormail]);

  if (result.rows.length === 0) {
    throw new Error("Member not found");
  }

  const member = result.rows[0];
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
  const query = "SELECT * FROM otps WHERE email = $1 AND otp_code = $2";
  const result = await pool.query(query, [email, otpCode]);

  if (result.rows.length === 0) {
    throw new Error("OTP not found or incorrect");
  }

  const otpEntry = result.rows[0];

  if (otpEntry.is_verified) {
    throw new Error("OTP has already been used");
  }

  const currentTime = new Date();
  if (currentTime > new Date(otpEntry.expires_at)) {
    throw new Error("OTP has expired");
  }

  const updateQuery =
    "UPDATE otps SET is_verified = $1, updatedAt = NOW() WHERE id = $2";
  await pool.query(updateQuery, [true, otpEntry.id]);

  const pendingMemberQuery =
    "SELECT * FROM pending_members WHERE email = $1 ORDER BY id DESC LIMIT 1";
  const pendingMemberResult = await pool.query(pendingMemberQuery, [email]);

  if (pendingMemberResult.rows.length === 0) {
    throw new Error("Pending member not found");
  }

  const pendingMember = pendingMemberResult.rows[0];

  const insertMemberQuery = `
    INSERT INTO members (username, password, plain_password, email)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
  const insertMemberValues = [
    pendingMember.username,
    pendingMember.password,
    pendingMember.plain_password,
    pendingMember.email,
  ];

  await pool.query(insertMemberQuery, insertMemberValues);

  const deletePendingMemberQuery =
    "DELETE FROM pending_members WHERE email = $1";
  await pool.query(deletePendingMemberQuery, [email]);

  return { message: "OTP successfully verified" };
}

module.exports = { registerMember, loginMember, verifyOtp, resendOtp };
