const express = require("express");
const {
  register,
  login,
  verify,
  resend,
  checkUsername,
  verifyResetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verify);
router.put("/resend-otp", resend);
router.get("/check-username/:username", checkUsername);
router.post("/reset-password", resetPassword);
router.put("/verify-reset-password", verifyResetPassword);

module.exports = router;
