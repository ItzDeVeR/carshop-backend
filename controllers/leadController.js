const leadModel = require("../models/leadModel");
const orderModel = require("../models/orderModel")
const carModel = require("../models/carModel")

exports.getAll = async (req, res, next) => {
  const { page, limit, tab, search, source } = req.query;

  try {
    const result = await leadModel.getLeads(page, limit, tab, search, source);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteLead = async (req, res, next) => {
  const id = req.params.id;

  try {
    await leadModel.deleteLead(id);
    return res.json({ message: `Заявка ${id} успешно удалена` })
  } catch (err) {
    next(err);
  }
}

exports.changeStatus = async (req, res, next) => {
  const id = req.params.id;
  const { status } = req.body;

  const statuses = ["NEW", "IN_PROGRESS", "CLOSED", "CANCELLED"];
  if (!statuses.includes(status)) {
    const err = new Error("Такого статуса не существует");
    err.status = 400;
    throw err;
  }

  try {
    await leadModel.changeStatus(id, status);
    return res.json({ message: `Статус заявки ${id} изменён` })
  } catch (err) {
    next(err);
  }
}

exports.convertToOrder = async (req, res, next) => {
  const id = req.params.id;
  const { car_id, client_name, client_phone, city_destination } = req.body;

  try {
    const car = await carModel.getCarById(car_id);

    if (!car) {
      const error = new Error("Нет данных для создания машины");
      error.status = 400;
      throw error;
    }

    await orderModel.createOrder(
      car,
      null,
      client_name,
      client_phone,
      city_destination,
    );

    await leadModel.changeStatus(id, "CLOSED");
    return res.json({ message: `Заказ успешно создан на основа ${id} заявки` })
  } catch (err) {
    next(err);
  }
}
