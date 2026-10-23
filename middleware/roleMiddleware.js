const { getUserRoleById } = require("../models/userModel");

module.exports = function (roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async function (req, res, next) {
    const userId = req.user;

    const userRole = await getUserRoleById(userId);

    if (!userRole) {
      const error = new Error("Пользователь не авторизован");
      error.status = 401;
      throw error;
    }

    if (!allowedRoles.includes(userRole)) {
      const error = new Error("Недостаточно прав");
      error.status = 403;
      throw error;
    }

    next();
  };
};
