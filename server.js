require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api/auth", authRoutes);

// Route sederhana
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
