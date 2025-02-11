const {
  registers,
  logins,
  verifies,
  resends,
  checkUsernames,
  resetPasswords,
  verifyResetPasswords,
  updatePasswords,
} = require("../services/authService");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const newMember = await registers(username, email, password);
    res.status(201).json({
      message: "OTP code has been sent, please check your email",
      member: newMember,
      status: "success",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: "failed" });
  }
}

async function login(req, res) {
  try {
    const { userormail, password } = req.body;
    const token = await logins(userormail, password);
    res
      .status(200)
      .json({ message: "Login successful", token, status: "success" });
  } catch (error) {
    res.status(401).json({ message: error.message, status: "failed" });
  }
}

async function verify(req, res) {
  try {
    const { email, otpCode } = req.body;
    const isVerified = await verifies(email, otpCode);
    if (isVerified) {
      res.status(200).json({ message: isVerified.message, status: "success" });
    } else {
      res.status(400).json({ message: "Invalid OTP", status: "failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

async function resend(req, res) {
  try {
    const { email } = req.body;
    const response = await resends(email);
    res.status(200).json({ message: response.message, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

async function checkUsername(req, res) {
  try {
    const { username } = req.params;
    const isTaken = await checkUsernames(username);
    if (isTaken) {
      res
        .status(200)
        .json({ message: "Username is already taken", status: "failed" });
    } else {
      res
        .status(200)
        .json({ message: "Username is available", status: "success" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

async function resetPassword(req, res) {
  try {
    const { email } = req.body;
    const response = await resetPasswords(email);
    res.status(200).json({ message: response.message, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

async function verifyResetPassword(req, res) {
  try {
    const { email, otpCode } = req.body;
    const response = await verifyResetPasswords(email, otpCode);
    res.status(200).json({ message: response.message, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

async function updatePassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const response = await updatePasswords(email, newPassword);
    res.status(200).json({ message: response.message, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

module.exports = {
  register,
  login,
  verify,
  resend,
  checkUsername,
  resetPassword,
  verifyResetPassword,
  updatePassword,
};
