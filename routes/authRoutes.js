const express = require("express");
const {
  register,
  login,
  verify,
  resend,
  checkUsername,
  resetPassword,
  verifyResetPassword,
  updatePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verify);
router.put("/resend-otp", resend);
router.get("/check-username/:username", checkUsername);
router.post("/reset-password", resetPassword);
router.put("/verify-reset-password", verifyResetPassword);
router.put("/update-password", updatePassword);

module.exports = router;
