const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../config/bcrypt");

const fs = require("fs").promises;
const path = require("path");

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("Пользователь не авторизован");
      error.status = 401;
      throw error;
    }

    const userid = req.user;

    const user = await userModel.getUserById(userid);
    if (!user) {
      const error = new Error("Пользователь не найден");
      error.status = 401;
      throw error;
    }

    const role = await userModel.getUserRoleById(userid);
    if (!role) {
      throw new Error("Невозможно получить роль пользователя");
    }
    user.role = role;

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.editMe = async (req, res, next) => {
  const normalFields = {
    full_name: "ФИО",
    email: "Email",
    phone: "Телефон",
    city: "Город проживания",
  };

  try {
    const { full_name, email, phone, city } = req.body || {};

    const validationResults = {
      full_name:
        full_name == null ||
        (typeof full_name === "string" && full_name.trim().length >= 8),
      email: typeof email === "string" && email.trim().length >= 4,
      phone: typeof phone === "string" && phone.trim().length >= 6,
      city:
        city == null || (typeof city === "string" && city.trim().length >= 2),
    };

    const invalidFields = Object.keys(validationResults)
      .filter((key) => !validationResults[key])
      .map((key) => normalFields[key]);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Неверно заполнены поля: ${invalidFields.join(", ")}`,
      });
    }

    const userid = req.user;

    await userModel.changeUserInfo(userid, email, phone, full_name, city);

    return res.json({ message: "Данные успешно изменены" });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldpassword, newpassword } = req.body;
    const userid = req.user;

    if (!oldpassword || !newpassword) throw new Error("Неверно введены данные");

    const userPassword = await userModel.getPasswordByUserId(userid);
    if (!userPassword) {
      const error = new Error("Пользователь не найден");
      error.status = 401;
      throw error;
    }

    const isValidOldPassword = await verifyPassword(
      oldpassword,
      userPassword.password_hash,
    );

    if (!isValidOldPassword) {
      throw new Error("Неверный старый пароль");
    }

    const newHashPassword = await hashPassword(newpassword);

    await userModel.changeUserPassword(userid, newHashPassword);

    return res.json({ message: "Пароль успешно изменен" });
  } catch (error) {
    next(error);
  }
};

exports.changeAvatar = async (req, res, next) => {
  try {
    const userid = req.user;

    if (!req.files) {
      throw new Error("Выберите фотографию");
    }

    const uploadedFile = req.files[0];

    const curUser = await userModel.getUserById(userid);

    if (curUser && curUser.avatar_url) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        "uploads/avatars",
        curUser.avatar_url,
      );

      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("Не удалось удалить старый файл:", err.message);
      }
    }

    const { filename } = uploadedFile;

    await userModel.changeUserAvatar(userid, filename);

    res.json({ message: "Фотография успешно обновлена", filename });
  } catch (error) {
    next(error);
  }
};

exports.getUsersByRole = async (req, res, next) => {
  const { role } = req.query;
  try {
    if (!req.query) {
      throw new Error("Введите корректную роль");
    }

    if (!["USER", "MANAGER", "ADMIN"].includes(role)) {
      throw new Error("Данной роли не существует")
    }

    const result = await userModel.getUsersByRole(role);

    res.json(result)
  } catch (error) {
    next(error)
  }
}
