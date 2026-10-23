const express = require("express");
const cors = require('cors');
const path = require("path");
require("dotenv").config();
const routes = require("./routes/index");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", routes);

app.use((req, res, next) => {
  const err = new Error(
    `Маршрут не найден: [${req.method}] ${req.originalUrl}`,
  );
  err.status = 404;
  next(err);
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
