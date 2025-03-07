const express = require("express");
const {
  updateMember,
  updateAvatar,
  deleteMember,
  updatePassword,
  getAllMember,
  getMember,
} = require("../controllers/membersController");
const { checkMemberStatus } = require("../middlewares/membersMiddleware");

const router = express.Router();

// Route to get members
router.get("/view", checkMemberStatus, getAllMember);
router.get("/view/:id", checkMemberStatus, getMember);
// Route to update member data
router.put("/update/:id", checkMemberStatus, updateMember);
router.put("/update-avatar/:id", checkMemberStatus, updateAvatar);
router.put("/update-password/:id", checkMemberStatus, updatePassword);
// Route to delete member
router.delete("/delete/:id", checkMemberStatus, deleteMember);

module.exports = router;
