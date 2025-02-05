const { members } = require("../models"); // Sesuaikan dengan model Anda

const checkMemberStatus = async (req, res, next) => {
  try {
    const user = req.user; // Asumsikan user sudah ada di request setelah pengecekan JWT

    if (user.status === "admin") {
      // Admin bisa mengupdate data apapun
      return next();
    }

    if (user.status === "member" && user.id === req.param.id) {
      // Member hanya bisa mengupdate data dirinya sendiri
      return next();
    }

    // Jika status member tidak sesuai
    return res
      .status(403)
      .json({ message: "Forbidden: You cannot update another member's data" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkMemberStatus };
