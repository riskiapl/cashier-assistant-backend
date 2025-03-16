const express = require("express");
const {
  register,
  login,
  verify,
  resend,
  checkUsername,
  resetPassword,
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
router.put("/update-password", (req, res) => {
  // Logic to update password
});
router.delete("/delete-password", (req, res) => {
  // Logic to delete password
});



module.exports = router;
