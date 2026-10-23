const express = require("express");
const { getUserByUsername, createUser } = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../config/bcrypt");
const { generateToken } = require("../config/jwt");
const router = express.Router();

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Заполните все поля корректно" });
    }

    const candidate = await getUserByUsername(username);
    if (!candidate) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const isPasswordValid = await verifyPassword(
      password,
      candidate.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const token = generateToken(candidate.id);

    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;

    const hashedPassword = await hashPassword(password);
    const result = await getUserByUsername(username.trim());

    if (result) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким логином уже существует" });
    }

    await createUser(username.trim(), email, phone, hashedPassword);

    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
  } catch (error) {
    next(error);
  }
};
