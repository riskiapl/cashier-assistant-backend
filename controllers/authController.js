const {
  registerMember,
  loginMember,
  verifyOtp,
} = require("../services/authService");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const newMember = await registerMember(username, email, password);
    res.status(201).json({
      message: "Kode OTP telah dikirim, silakan cek email Anda",
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
    const token = await loginMember(userormail, password);
    res
      .status(200)
      .json({ message: "Login berhasil", token, status: "success" });
  } catch (error) {
    res.status(401).json({ message: error.message, status: "failed" });
  }
}

async function verify(req, res) {
  try {
    const { email, otpCode } = req.body;
    const isVerified = await verifyOtp(email, otpCode);
    if (isVerified) {
      res
        .status(200)
        .json({ message: "OTP berhasil diverifikasi", status: "success" });
    } else {
      res.status(400).json({ message: "OTP tidak valid", status: "failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

module.exports = { register, login, verify };
