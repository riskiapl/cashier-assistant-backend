const multer = require("multer");
const path = require("path");
const {
  updateMemberData,
  updateMemberAvatar,
  deleteMemberData,
  updatePasswords,
  getAllMembers,
  getMembers,
} = require("../services/membersService");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single("avatar");

// Controller to update member data
const updateMember = async (req, res) => {
  const memberId = req.params.id;
  const updateData = req.body;

  try {
    const updatedMember = await updateMemberData(memberId, updateData);
    res.status(200).send({
      status: "success",
      message: "Member data updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    res.status(500).send({ message: err.message, error: err });
  }
};

// Controller to update member avatar
const updateAvatar = (req, res) => {
  const memberId = req.params.id;

  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error uploading avatar", error: err });
    }

    const avatarPath = req.file.path;

    try {
      const updatedMember = await updateMemberAvatar(memberId, avatarPath);
      res.status(200).send({
        status: "success",
        message: "Avatar updated successfully",
        member: updatedMember,
      });
    } catch (err) {
      res.status(500).send({ message: err.message, error: err });
    }
  });
};

// Controller to delete a member
const deleteMember = async (req, res) => {
  const memberId = req.params.id;

  try {
    await deleteMemberData(memberId);
    res.status(200).send({
      status: "success",
      message: "Member deleted successfully",
    });
  } catch (err) {
    res.status(500).send({ message: err.message, error: err });
  }
};

// Controller to update member password
async function updatePassword(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const response = await updatePasswords(email, oldPassword, newPassword);
    res.status(200).json({ message: response.message, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
  }
}

// Controller to get all members
const getAllMember = async (req, res) => {
  try {
    const members = await getAllMembers();
    res.status(200).json({
      status: "success",
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

// Controller to get single member by ID
const getMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await getMembers(memberId);

    if (!member) {
      return res.status(404).json({
        status: "failed",
        message: "Member not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  updateMember,
  updateAvatar,
  deleteMember,
  updatePassword,
  getAllMember,
  getMember,
};
