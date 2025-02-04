require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cron = require("node-cron");
const { deleteExpiredPendingMembers } = require("./services/helperService");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use("/api/auth", authRoutes);

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
