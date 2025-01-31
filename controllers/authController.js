const { registerMember, loginMember } = require("../services/authService");

async function register(req, res) {
  try {
    const { username, password } = req.body;
    const newMember = await registerMember(username, password);
    res.status(201).json({ message: "Registrasi berhasil", member: newMember });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const token = await loginMember(username, password);
    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = { register, login };
