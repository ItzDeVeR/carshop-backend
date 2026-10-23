const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const carRoutes = require("./carRoutes");
const favoriteRoutes = require("./favoriteRoutes");
const orderRoutes = require("./orderRoutes");
const leadRoutes = require("./leadRoutes");

router.get("/health", (req, res) => {
  res.json({ status: "OK", message: "CarShop API работает!" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/cars", carRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/orders", orderRoutes);
router.use("/leads", leadRoutes);

module.exports = router;
