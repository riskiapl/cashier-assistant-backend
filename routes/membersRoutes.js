const express = require("express");
const {
  updateMember,
  updateAvatar,
  deleteMember,
} = require("../controllers/membersController");
const { checkMemberStatus } = require("../middlewares/membersMiddleware");

const router = express.Router();

// Route to update member data
router.put("/update/:id", checkMemberStatus, updateMember);
router.put("/update-avatar/:id", checkMemberStatus, updateAvatar);
// Route to delete member
router.delete("/delete/:id", checkMemberStatus, deleteMember);

module.exports = router;
