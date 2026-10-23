const express = require("express");
const router = express.Router();

const roleMiddleware = require("../middleware/roleMiddleware");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const leadController = require("../controllers/leadController");

router.get(
  "/all",
  jwtMiddleware,
  roleMiddleware(["MANAGER", "ADMIN"]),
  leadController.getAll,
);

router.delete("/:id", jwtMiddleware, roleMiddleware(["MANAGER", "ADMIN"]), leadController.deleteLead);

router.patch("/:id", jwtMiddleware, roleMiddleware(["MANAGER", "ADMIN"]), leadController.changeStatus);

router.post("/:id/convert", jwtMiddleware, roleMiddleware(["MANAGER", "ADMIN"]), leadController.convertToOrder)

module.exports = router;
