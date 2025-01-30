const express = require("express");
const app = express();

// Middleware untuk membaca request body JSON
app.use(express.json());

// Jalankan server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Route sederhana
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.post("/api/data", (req, res) => {
  const data = req.body;
  res.json({ message: "Data received", data });
});
