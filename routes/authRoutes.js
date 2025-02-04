const express = require("express");
const {
  register,
  login,
  verify,
  resend,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verify);
router.put("/resend-otp", resend);

module.exports = router;
