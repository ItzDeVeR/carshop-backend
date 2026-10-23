const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const favoriteController = require("../controllers/favoriteController");

router.get("/", jwtMiddleware, favoriteController.getFavorites);
router.post("/", jwtMiddleware, favoriteController.toggleFavorite);
router.delete("/all", jwtMiddleware, favoriteController.removeAllFavCars);

module.exports = router;
