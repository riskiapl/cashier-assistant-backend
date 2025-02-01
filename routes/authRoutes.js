const express = require("express");
const { register, login, verify } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verify);

module.exports = router;
