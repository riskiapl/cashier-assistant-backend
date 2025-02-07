require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cron = require("node-cron");
const {
  deleteExpiredPendingMembers,
  deleteExpiredOtps,
} = require("./services/helperService");
const membersRoutes = require("./routes/membersRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const {
  cleanNullValues,
  removeUnusedKey,
} = require("./middlewares/helperMiddleware");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

const app = express();
const port = process.env.PORT || 8000;

// Load db
require("./config/db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cleanNullValues);
app.use(removeUnusedKey);

// Semua Route
app.use("/api/auth", authRoutes);
app.use("/api/member", verifyToken, membersRoutes);

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
  deleteExpiredOtps();
});
