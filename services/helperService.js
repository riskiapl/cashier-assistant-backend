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
        created_at: {
          [db.Sequelize.Op.lt]: db.Sequelize.literal(
            "NOW() - INTERVAL '1 day'"
          ),
        },
      },
    });

    console.log(
      "Data pending_members yang sudah lebih dari 1 hari telah dihapus"
    );
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  }
}

module.exports = { deleteExpiredPendingMembers };
