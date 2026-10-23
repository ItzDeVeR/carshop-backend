const carModel = require("../models/carModel");

exports.findCars = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      country_code,
      price_rub,
      sort_by,
      condition,
      page,
      limit,
    } = req.query;

    const cars = await carModel.getCarsByQuery(
      name,
      brand,
      country_code,
      price_rub,
      sort_by,
      condition,
      page,
      limit,
    );

    return res.json(cars);
  } catch (err) {
    next(err);
  }
};

exports.getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      const error = new Error("Айди автомобиля может быть только числовым");
      error.status = 404;
      throw error;
    }

    const selectedCar = await carModel.getCarById(id);

    return res.json(selectedCar);
  } catch (err) {
    next(err);
  }
};

exports.createNewCar = async (req, res, next) => {
  try {
    if (!req.body) {
      const error = new Error("Нет данных для создания машины");
      error.status = 400;
      throw error;
    }

    const carData = req.body;
    await carModel.createCar(carData);

    return res.status(201).json({ message: "Машина успешно создана" });
  } catch (err) {
    next(err);
  }
};
