const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const optinalJwtMiddleware = require("../middleware/optinalJwtMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const orderController = require("../controllers/orderController");
const router = express.Router();

router.get("/", jwtMiddleware, orderController.getOrderByUser);
router.post("/new", optinalJwtMiddleware, orderController.createNewOrder);
router.delete(
  "/:id",
  jwtMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  orderController.deleteOrder,
);

router.get(
  "/all",
  jwtMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  orderController.getAllOrders,
);

router.patch(
  "/claim",
  jwtMiddleware,
  roleMiddleware(["MANAGER"]),
  orderController.claimOrder,
);

router.patch(
  "/edit",
  jwtMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  orderController.editOrderManager,
);

router.patch("/reclaim", jwtMiddleware, roleMiddleware(["ADMIN"]), orderController.reclaim)

module.exports = router;
