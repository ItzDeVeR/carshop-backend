const orderModel = require("../models/orderModel");
const carModel = require("../models/carModel");
const userModel = require("../models/userModel")

exports.getOrderByUser = async (req, res, next) => {
  const userid = req.user;

  try {
    const result = await orderModel.getOrdersByUser(userid);
    const formattedData = result.map(
      ({ manager_name, manager_phone, ...item }) => {
        return {
          ...item,
          manager: {
            name: manager_name,
            phone: manager_phone,
          },
        };
      },
    );
    return res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

exports.createNewOrder = async (req, res, next) => {
  const userId = req.user ? req.user : null;
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
      userId,
      client_name,
      client_phone,
      city_destination,
    );

    res.status(201).json({ message: "Заказ успешно создан" });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  const id = req.params.id;

  try {
    await orderModel.removeOrder(id);
    res.status(200).json({ message: "Заказ успешно удален" });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  const { page, limit, tab } = req.query;
  const managerId = req.user;

  try {
    const result = await orderModel.getAllOrders(page, limit, tab, managerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.claimOrder = async (req, res, next) => {
  const managerId = req.user;

  try {
    if (!req.body || !managerId) {
      const error = new Error("Нет данных для создания заказа");
      error.status = 400;
      throw error;
    }

    const { order_id } = req.body;

    const candidateOrder = await orderModel.getOrderById(order_id);

    if (!candidateOrder) {
      throw new Error("Данного заказа не существует");
    }

    if (candidateOrder.manager_id === managerId) {
      const error = new Error("Вы уже отвечаете за этот заказ");
      error.status = 400;
      throw error;
    }

    if (!candidateOrder || candidateOrder.manager_id !== null) {
      const error = new Error(
        "Данный заказ занят. Свяжитесь с администратором для смены менджера",
      );
      error.status = 400;
      throw error;
    }

    await orderModel.claimOrder(order_id, managerId);

    res.status(200).json({ message: "Теперь Вы отвечаете за этот заказ" });
  } catch (error) {
    next(error);
  }
};

exports.editOrderManager = async (req, res, next) => {
  const { order_id, order } = req.body;

  try {
    const candidateOrder = await orderModel.getOrderById(order_id);

    if (!candidateOrder) {
      const err = new Error(`Заказ ${order_id} не найден`);
      err.status = 404;
      throw err;
    }

    const roleFromRequest = await userModel.getUserRoleById(req.user);

    if (roleFromRequest !== "ADMIN") {
      if (candidateOrder.manager_id !== req.user) {
        const error = new Error("Вы не отвечаете за этот заказ");
        error.status = 403;
        throw error;
      }
    }

    await orderModel.editOrderManager(order_id, order);

    res.json({ message: "Данные заказа успешно обновлены" });
  } catch (error) {
    next(error);
  }
};

exports.reclaim = async (req, res, next) => {
  const { id, manager_id } = req.body;

  try {
    const candidateOrder = await orderModel.getOrderById(id);

    if (!candidateOrder) {
      const err = new Error(`Заказ ${id} не найден`);
      err.status = 404;
      throw err;
    }

    if (manager_id !== null) {
      const candidateManager = await userModel.getUserById(manager_id);

      if (!candidateManager) {
        const err = new Error(`Пользователь с таким ${manager_id} не найден`)
        err.status = 404;
        throw err;
      }
    }

    if (manager_id === Number(candidateOrder.manager_id)) {
      const err = new Error("Данный менеджер уже отвечает за этот заказ");
      err.status = 409;
      throw err;
    }

    await orderModel.changeOrderManager(id, manager_id);

    res.json({ message: "Менеджер успешно изменен" });
  } catch (error) {
    next(error);
  }
}
