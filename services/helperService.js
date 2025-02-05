const pool = require("../config/db");
const db = require("../models");
const { members, otps, pending_members } = db;

async function deleteExpiredPendingMembers() {
  try {
    // raw query
    // const query = `DELETE FROM pending_members WHERE created_at < NOW() - INTERVAL '1 day';`;
    // await pool.query(query);

    // menggunakan Sequelize
    await pending_members.destroy({
      where: {
        createdAt: {
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

module.exports = { deleteExpiredPendingMembers };
