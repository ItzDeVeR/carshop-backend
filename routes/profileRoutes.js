const express = require("express");
const router = express.Router();
const { uploadAvatars } = require("../middleware/uploadMiddleware");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware")
const profileController = require("../controllers/profileController");

router.get("/me", jwtMiddleware, profileController.getMe);
router.patch("/me", jwtMiddleware, profileController.editMe);
router.patch("/password", jwtMiddleware, profileController.changePassword);
router.patch(
  "/avatar",
  jwtMiddleware,
  uploadAvatars.any(),
  profileController.changeAvatar,
);

router.get("/roles", jwtMiddleware, roleMiddleware(["ADMIN"]), profileController.getUsersByRole);

module.exports = router;
