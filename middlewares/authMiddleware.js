const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Mengambil token setelah "Bearer"
  if (!token) {
    return res.status(401).json({ message: "Bearer token missing" });
  }

  // Verifikasi token dengan secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Simpan data decoded ke request untuk digunakan di route handler
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
