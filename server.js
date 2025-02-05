require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cron = require("node-cron");
const { deleteExpiredPendingMembers } = require("./services/helperService");
const membersRoutes = require("./routes/membersRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const { checkMemberStatus } = require("./middlewares/membersMiddleware");
const {
  cleanNullValues,
  removeUnusedKey,
} = require("./middlewares/helperMiddleware");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cleanNullValues);
app.use(removeUnusedKey);
app.use("/api/auth", authRoutes);
app.use("/api/member", verifyToken, checkMemberStatus, membersRoutes);

// Route sederhana
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Jalankan fungsi untuk setiap jam
cron.schedule("0 * * * *", () => {
  deleteExpiredPendingMembers();
});
