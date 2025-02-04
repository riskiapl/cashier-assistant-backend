const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../config/mailer");
const { otpMail } = require("../config/helper");

async function registerMember(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("Username, email, dan password tidak boleh kosong");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // pengecekan apakah username atau email sudah terdaftar
  const existingEmailQuery = "SELECT * FROM members WHERE email = $1";
  const existingEmailResult = await pool.query(existingEmailQuery, [email]);

  if (existingEmailResult.rows.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const existingUsernameQuery = "SELECT * FROM members WHERE username = $1";
  const existingUsernameResult = await pool.query(existingUsernameQuery, [
    username,
  ]);

  if (existingUsernameResult.rows.length > 0) {
    throw new Error("Username sudah terdaftar, silakan gunakan username lain");
  }

  const existingPendingUsernameQuery =
    "SELECT * FROM pending_members WHERE username = $1 AND email != $2";
  const existingPendingUsernameResult = await pool.query(
    existingPendingUsernameQuery,
    [username, email]
  );

  if (existingPendingUsernameResult.rows.length > 0) {
    throw new Error("Username sudah terdaftar, silakan gunakan username lain");
  }

  // generate and send OTP
  await generateAndSendOtp(email);

  // add user to pending_members table
  // pengecekan apakah email sudah ada di tabel pending_members
  const existingPendingUserQuery =
    "SELECT * FROM pending_members WHERE email = $1";
  const existingPendingUserResult = await pool.query(existingPendingUserQuery, [
    email,
  ]);

  if (existingPendingUserResult.rows.length > 0) {
    const updatePendingUserQuery = `
      UPDATE pending_members
      SET username = $1, password = $2, plain_password = $3, email = $4
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

  const otpQuery =
    "INSERT INTO otps (email, otp_code, expires_at, is_verified) VALUES ($1, $2, $3, $4)";
  const otpValues = [email, otpCode, expiresAt, false];

  await pool.query(otpQuery, otpValues);

  // send OTP to email
  const emailSubject = "Your OTP Code";
  const emailBody = otpMail(otpCode, "15 minutes");

  await sendMail(email, emailSubject, emailBody);
}

async function resendOtp(email) {
  const existingOtpQuery =
    "SELECT * FROM otps WHERE email = $1 ORDER BY id DESC LIMIT 1";
  const existingOtpResult = await pool.query(existingOtpQuery, [email]);

  if (existingOtpResult.rows.length === 0) {
    throw new Error("OTP tidak ditemukan, silakan daftar terlebih dahulu");
  }

  const otpEntry = existingOtpResult.rows[0];
  const currentTime = new Date();

  if (currentTime < new Date(otpEntry.expires_at)) {
    throw new Error("OTP masih berlaku, silakan cek email Anda");
  }

  await generateAndSendOtp(email);
  return { message: "OTP baru telah dikirim ke email Anda" };
}

async function loginMember(userormail, password) {
  const query = "SELECT * FROM members WHERE username = $1 OR email = $1";
  const result = await pool.query(query, [userormail]);

  if (result.rows.length === 0) {
    throw new Error("Member tidak ditemukan");
  }

  const member = result.rows[0];
  const isMatch = await bcrypt.compare(password, member.password);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const token = jwt.sign(
    { id: member.id, username: member.username },
    process.env.JWT_SECRET,
    {
      // expiresIn: "1d",
      expiresIn: "1h",
    }
  );

  return token;
}

async function verifyOtp(email, otpCode) {
  const query = "SELECT * FROM otps WHERE email = $1 AND otp_code = $2";
  const result = await pool.query(query, [email, otpCode]);

  if (result.rows.length === 0) {
    throw new Error("OTP tidak ditemukan atau salah");
  }

  const otpEntry = result.rows[0];

  if (otpEntry.is_verified) {
    throw new Error("OTP sudah pernah digunakan");
  }

  const currentTime = new Date();
  if (currentTime > new Date(otpEntry.expires_at)) {
    throw new Error("OTP sudah kadaluarsa");
  }

  const updateQuery = "UPDATE otps SET is_verified = $1 WHERE id = $2";
  await pool.query(updateQuery, [true, otpEntry.id]);

  const pendingMemberQuery =
    "SELECT * FROM pending_members WHERE email = $1 ORDER BY id DESC";
  const pendingMemberResult = await pool.query(pendingMemberQuery, [email]);

  if (pendingMemberResult.rows.length === 0) {
    throw new Error("Pending member tidak ditemukan");
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

  return true;
}

module.exports = { registerMember, loginMember, verifyOtp };
