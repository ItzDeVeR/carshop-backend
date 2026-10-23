const express = require("express");
const carsController = require("../controllers/carsController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", carsController.findCars);

router.get("/:id", carsController.getCarById);

router.post(
  "/new",
  jwtMiddleware,
  roleMiddleware("ADMIN"),

  carsController.createNewCar,
);

module.exports = router;
