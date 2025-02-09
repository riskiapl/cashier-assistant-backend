const express = require("express");
const {
  register,
  login,
  verify,
  resend,
  checkUsername,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verify);
router.put("/resend-otp", resend);
router.get("/check-username", checkUsername);

module.exports = router;
