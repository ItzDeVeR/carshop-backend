module.exports = function (err, req, res, next) {

  console.error("❌ Ошибка на сервере:", err.message || err);

  if (err.status === 404) {
    return res.status(404).json({
      status: "error",
      message: err.message || "Маршрут не найден",
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "Запись с такими данными уже существует (Email, Логин или VIN)",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      status: "error",
      message: "Связанная запись не найдена (неверный ID)",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Невалидный токен авторизации",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Срок действия токена истек, войдите заново",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      status: "error",
      message: "Размер файла превышает допустимый лимит",
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      status: "error",
      message: err.message || "Не авторизован",
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Внутренняя ошибка сервера";

  return res.status(statusCode).json({
    status: "error",

    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
