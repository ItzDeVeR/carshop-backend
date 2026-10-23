const db = require("../config/db");

async function getOrdersByUser(userId) {
  const result = await db.query(
    "SELECT o.id, o.car_name, o.car_year, o.country, o.city_destination, o.total_price, o.status, o.contract_pdf_url, o.created_at, c.main_image, u.full_name as manager_name, u.phone as manager_phone FROM orders o LEFT JOIN users u ON o.manager_id = u.id LEFT JOIN cars c ON o.car_id = c.id WHERE o.user_id = $1",
    [userId],
  );

  return result.rows;
}

async function createOrder(
  car,
  userid,
  client_name,
  client_phone,
  city_destination,
) {
  const newOrder = await db.query(
    `INSERT INTO orders
        (user_id, car_id, client_name, phone, car_name, car_year, country, city_destination, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      userid,
      car.id,
      client_name,
      client_phone,
      car.name,
      car.year,
      car.country,
      city_destination,
      car.price_rub,
    ],
  );

  return newOrder.rows[0];
}

async function removeOrder(orderId) {
  const result = await db.query("DELETE FROM orders WHERE id = $1", [orderId]);

  if (result.rowCount === 0) {
    const error = new Error("Заказ не найден");
    error.status = 404;
    throw error;
  }

  return result.rows[0];
}

async function getAllOrders(page = 1, limit = 20, tab = "all", managerId = null) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const whereConditions = [];
  const queryParams = [];

  if (tab === "my" && managerId) {
    queryParams.push(managerId);
    whereConditions.push(`manager_id = $${queryParams.length}`);
  } else if (tab === "unassigned") {
    whereConditions.push(`manager_id IS NULL`);
  }

  const whereClause = whereConditions.length > 0
    ? ` WHERE ${whereConditions.join(" AND ")}`
    : "";

  queryParams.push(limitNum);
  const limitIdx = queryParams.length;

  queryParams.push(offset);
  const offsetIdx = queryParams.length;

  const ordersSql = `
    SELECT o.id, o.client_name, o.phone, o.car_name, o.car_year, o.country, o.city_destination, o.total_price, o.status, o.created_at, u.full_name as manager_name, u.username as manager_username
    FROM orders o
    LEFT JOIN users u
    ON o.manager_id = u.id
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const statsSql = `
    SELECT
      COUNT(*) AS all_count,
      COUNT(*) FILTER (WHERE manager_id = $1) AS my_count,
      COUNT(*) FILTER (WHERE manager_id IS NULL) AS unassigned_count
    FROM orders
  `;

  const [ordersResult, statsResult] = await Promise.all([
    db.query(ordersSql, queryParams),
    db.query(statsSql, [managerId]),
  ]);

  const stats = statsResult.rows[0];
  const allCount = parseInt(stats.all_count, 10);
  const myCount = parseInt(stats.my_count, 10);
  const unassignedCount = parseInt(stats.unassigned_count, 10);

  let currentTabTotal = allCount;
  if (tab === "my") currentTabTotal = myCount;
  if (tab === "unassigned") currentTabTotal = unassignedCount;

  return {
    orders: ordersResult.rows,
    pagination: {
      total: currentTabTotal,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(currentTabTotal / limitNum) || 1,
    },
    counts: {
      all: allCount,
      my: myCount,
      unassigned: unassignedCount,
    },
  };
}

async function getOrderById(orderId) {
  const result = await db.query("SELECT * FROM orders WHERE id = $1", [
    orderId,
  ]);

  return result.rows[0];
}

async function claimOrder(orderId, managerId) {
  await db.query("UPDATE orders SET manager_id = $1 WHERE id = $2", [
    managerId,
    orderId,
  ]);
}

async function editOrderManager(orderId, order) {
  const totalRows = await db.query(
    "UPDATE orders SET client_name = $1, phone = $2, car_name = $3, car_year = $4, country = $5, city_destination = $6, total_price = $7, status = $8 WHERE id = $9",
    [
      order.client_name,
      order.phone,
      order.car_name,
      order.car_year,
      order.country,
      order.city_destination,
      order.total_price,
      order.status,
      orderId,
    ],
  );

  return totalRows.rowCount;
}

async function changeOrderManager(order_id, manager_id) {
  const totalRows = await db.query("UPDATE orders SET manager_id = $1 WHERE id = $2", [manager_id, order_id]);

  return totalRows.rowCount;
}

module.exports = {
  getOrdersByUser,
  createOrder,
  removeOrder,
  getAllOrders,
  getOrderById,
  claimOrder,
  editOrderManager,
  changeOrderManager
};
