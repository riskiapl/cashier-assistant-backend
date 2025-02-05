const express = require("express");
const {
  updateMember,
  updateAvatar,
} = require("../controllers/membersController");

const router = express.Router();

// Route to update member data
router.put("/update/:id", updateMember);
router.put("/update-avatar/:id", updateAvatar);

module.exports = router;
