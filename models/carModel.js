const db = require("../config/db");

async function getAllCars() {
  const result = await db.query("SELECT * FROM cars");
  return result.rows;
}

async function getCarsByQuery(
  name,
  brand,
  country_code,
  price_rub,
  sort_by,
  condition,
  page = 1,
  limit = 20,
) {
  let sql = "SELECT * FROM cars";
  const conditions = [];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }

  if (brand) {
    params.push(brand);
    conditions.push(`brand = $${params.length}`);
  }

  if (country_code) {
    params.push(country_code);
    conditions.push(`country_code = $${params.length}`);
  }

  if (price_rub) {
    params.push(Number(price_rub));
    conditions.push(`price_rub <= $${params.length}`);
  }

  if (condition) {
    params.push(condition);
    conditions.push(`condition = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  if (sort_by === "price_asc") {
    sql += " ORDER BY price_rub ASC";
  } else if (sort_by === "price_desc") {
    sql += " ORDER BY price_rub DESC";
  } else if (sort_by === "year_asc") {
    sql += " ORDER BY year DESC";
  } else sql += " ORDER BY id ASC";

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const whereClause =
    conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
  const countSql = `SELECT COUNT(*) FROM cars ${whereClause}`;

  sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

  const [result, countResult] = await Promise.all([
    db.query(sql, params),
    db.query(countSql, params),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    cars: result.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

async function getCarById(carId) {

  const [carRes, imagesRes, breakdownRes] = await Promise.all([
    db.query('SELECT * FROM cars WHERE id = $1', [carId]),
    db.query('SELECT * FROM car_images WHERE car_id = $1 ORDER BY sort_order ASC', [carId]),
    db.query('SELECT * FROM car_price_breakdowns WHERE car_id = $1 ORDER BY sort_order ASC', [carId])
  ]);

  if (carRes.rows.length === 0) {
    const error = new Error("Машина не найдена");
    error.status = 404;
    throw error;
  }

  const car = carRes.rows[0];

  const maskedVin = car?.vin ? car.vin.replace(/^(.{3}).{8}/, "$1********") : null;

  const carData = {
    ...car,
    vin: maskedVin,
    images: imagesRes.rows,
    price_breakdown: breakdownRes.rows
  };

  return carData;
}

async function isExistedVin(vin) {
  const result = await db.query("SELECT * FROM cars WHERE vin = $1", [vin]);

  if (result.rows > 0) {
    return true;
  } else return false;
}

async function createCar(carData) {
  const {
    name,
    brand,
    model,
    year,
    price_rub,
    price_original_currency,
    country,
    country_code,
    status,
    condition,
    mileage_km = 0,
    engine_info,
    transmission,
    drive_type,
    color,
    location,
    delivery_time_text,
    vin,
    description,
    main_image,
  } = carData;
  const isExistedCarByVin = await isExistedVin(vin);

  if (isExistedCarByVin) {
    const error = new Error("Машина с таким VIN уже существует");
    error.status = 400;
    throw error;
  }

  await db.query(
    "INSERT INTO cars (name, brand, model, year, price_rub, price_original_currency, country, country_code, status, condition, mileage_km, engine_info, transmission, drive_type, color, location, delivery_time_text, vin, description, main_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)",
    [
      name,
      brand,
      model,
      year,
      price_rub,
      price_original_currency || null,
      country,
      country_code,
      status,
      condition,
      mileage_km,
      engine_info,
      transmission,
      drive_type,
      color || null,
      location || null,
      delivery_time_text || null,
      vin || null,
      description || null,
      main_image,
    ],
  );
}

module.exports = {
  getAllCars,
  getCarsByQuery,
  getCarById,
  createCar,
};
