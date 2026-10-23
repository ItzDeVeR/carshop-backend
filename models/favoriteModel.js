const db = require("../config/db");

async function getFavoriteCarsByUser(userId) {
  const result = await db.query(
    "SELECT c.id, c.name, c.year, c.price_rub, c.price_original_currency, c.country, c.country_code, c.status, c.mileage_km, c.engine_info, c.drive_type, c.delivery_time_text, c.main_image FROM favorites f INNER JOIN cars c ON f.car_id = c.id WHERE f.user_id = $1",
    [userId],
  );
  return result.rows;
}

async function addFavoriteCar(carId, userId) {
  await db.query("INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)", [
    userId,
    carId,
  ]);
}

async function removeFavoriteCar(carId, user_id) {
  await db.query("DELETE FROM favorites WHERE user_id = $1 AND car_id = $2", [
    user_id,
    carId,
  ]);
}

async function removeAllFavoriteCar(user_id) {
  await db.query("DELETE FROM favorites WHERE user_id = $1", [user_id]);
}

async function checkIsFavorite(userId, car_id) {
  let sql = "SELECT COUNT (*) FROM favorites WHERE user_id = $1";
  const params = [userId];

  if (car_id) {
    sql += " AND car_id = $2";
    params.push(car_id);
  }

  const result = await db.query(sql, params);
  return result.rows[0].count;
}

module.exports = {
  getFavoriteCarsByUser,
  addFavoriteCar,
  removeFavoriteCar,
  removeAllFavoriteCar,
  checkIsFavorite,
};
