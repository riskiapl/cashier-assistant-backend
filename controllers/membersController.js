const multer = require("multer");
const path = require("path");
const {
  updateMemberData,
  updateMemberAvatar,
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
      message: "Member data updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    res.status(500).send({ message: "Error updating member data", error: err });
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
        message: "Avatar updated successfully",
        member: updatedMember,
      });
    } catch (err) {
      res.status(500).send({ message: "Error updating avatar", error: err });
    }
  });
};

module.exports = {
  updateMember,
  updateAvatar,
};
