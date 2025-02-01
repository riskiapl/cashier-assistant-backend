const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

async function registerMember(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("Username, email, dan password tidak boleh kosong");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUserQuery =
    "SELECT * FROM members WHERE username = $1 OR email = $2";
  const existingUserResult = await pool.query(existingUserQuery, [
    username,
    email,
  ]);

  if (existingUserResult.rows.length > 0) {
    throw new Error("Username atau email sudah terdaftar");
  }

  const query =
    "INSERT INTO members (username, password, plain_password, email) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [username, hashedPassword, password, email];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function loginMember(username, password) {
  const query = "SELECT * FROM members WHERE username = $1";
  const result = await pool.query(query, [username]);

  if (result.rows.length === 0) {
    throw new Error("Username tidak ditemukan");
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

module.exports = { registerMember, loginMember };
