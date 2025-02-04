const pool = require("../config/db");

async function deleteExpiredPendingMembers() {
  try {
    const query = `DELETE FROM pending_members WHERE created_at < NOW() - INTERVAL '1 day';`;
    await pool.query(query);
    console.log(
      "Data pending_members yang sudah lebih dari 1 hari telah dihapus"
    );
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  }
}

module.exports = { deleteExpiredPendingMembers };
