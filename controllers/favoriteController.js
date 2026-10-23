const carModel = require("../models/carModel");
const favoriteModel = require("../models/favoriteModel");

exports.getFavorites = async (req, res, next) => {
  const userid = req.user;

  try {
    const favoriteCars = await favoriteModel.getFavoriteCarsByUser(userid);
    return res.json(favoriteCars);
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  const userid = req.user;
  const { car_id } = req.body;

  if (!req.body) {
    throw new Error("Необходимо указать автомобиль");
  }

  try {
    const car = await carModel.getCarById(car_id);

    if (!car) {
      throw new Error("Такого автомобиля не существует");
    }

    const isFavorite = await favoriteModel.checkIsFavorite(userid, car_id);

    if (isFavorite === "0") {
      await favoriteModel.addFavoriteCar(car_id, userid);
      return res.json({ message: "Машина успешно добавлена в избранное" });
    }
    else {
      await favoriteModel.removeFavoriteCar(car_id, userid);
      return res.json({ message: "Машина успешно удалена из избранного" });
    }

  } catch (error) {
    next(error);
  }
};

exports.removeAllFavCars = async (req, res, next) => {
  const userid = req.user;

  try {
    const isFavorite = await favoriteModel.checkIsFavorite(userid);

    if (isFavorite === "0") {
      throw new Error("У Вас пока не добавлено машин в избранное");
    }

    await favoriteModel.removeAllFavoriteCar(userid);
    return res.json({ message: "Вы очистили список Ваших избранных авто :c" });
  } catch (error) {
    next(error);
  }
};
