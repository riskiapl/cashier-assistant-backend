const checkMemberStatus = async (req, res, next) => {
  try {
    const user = req.user; // Asumsikan user sudah ada di request setelah pengecekan JWT
    const params = req.params; // Mengambil parameter dari request

    if (user.status === "admin") {
      // Admin bisa mengupdate data apapun
      return next();
    }

    if (params.id && user.status === "member" && user.id == params.id) {
      // Member hanya bisa mengupdate data dirinya sendiri
      return next();
    }

    // Jika status member tidak sesuai
    return res.status(403).json({
      message: "Forbidden: You don't have permission to access this resource",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkMemberStatus };
