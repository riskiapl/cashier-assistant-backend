const db = require("../models");
const { pending_members, otps } = db;

async function deleteExpiredPendingMembers() {
  try {
    // menggunakan Sequelize
    await pending_members.destroy({
      where: {
        created_at: {
          [db.Sequelize.Op.lt]: db.Sequelize.literal(
            "NOW() - INTERVAL '1 day'"
          ),
        },
      },
    });
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  }
}

async function deleteExpiredOtps() {
  try {
    // menggunakan Sequelize
    await otps.destroy({
      where: {
        created_at: {
          [db.Sequelize.Op.lt]: db.Sequelize.literal(
            "NOW() - INTERVAL '1 day'"
          ),
        },
      },
    });
  } catch (error) {
    console.error("Gagal menghapus data OTP:", error);
  }
}

module.exports = { deleteExpiredPendingMembers, deleteExpiredOtps };
