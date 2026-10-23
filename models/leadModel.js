const db = require("../config/db");

async function getLeads(
  page = 1,
  limit = 20,
  tab = "all",
  search = "",
  source = "",
) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const whereConditions = [];
  const queryParams = [];

  const STATUS_MAP = {
    new: "NEW",
    in_progress: "IN_PROGRESS",
    closed: "CLOSED",
    cancelled: "CANCELLED",
  };

  if (tab !== "all" && STATUS_MAP[tab]) {
    queryParams.push(STATUS_MAP[tab]);
    whereConditions.push(`l.status = $${queryParams.length}`);
  }

  const searchQuery = String(search).trim();
  if (searchQuery) {
    queryParams.push(`%${searchQuery}%`);
    const searchIndex = queryParams.length;

    whereConditions.push(
      `(l.name ILIKE $${searchIndex} OR l.phone ILIKE $${searchIndex} OR l.message ILIKE $${searchIndex} OR c.name ILIKE $${searchIndex})`,
    );
  }

  if (source) {
    queryParams.push(source.toUpperCase());
    const sourceIndex = queryParams.length;
    whereConditions.push(`l.source_type = $${sourceIndex}`);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const limitParamIndex = queryParams.length + 1;
  const offsetParamIndex = queryParams.length + 2;
  queryParams.push(limitNum, offset);

  const sql = `
    SELECT
      l.id, l.name, l.phone, l.source_type, l.message, l.status, l.created_at,
      c.id as car_id, c.name as car_name
    FROM leads l
    LEFT JOIN cars c ON l.car_id = c.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
  `;

  const countSql = `
    SELECT
      COUNT(*) AS all_count,
      COUNT(*) FILTER (WHERE status = 'NEW') as new_count,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as progress_count,
      COUNT(*) FILTER (WHERE status = 'CLOSED') as closed_count,
      COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count
    FROM leads;
  `;

  const [countResult, queryResult] = await Promise.all([
    db.query(countSql),
    db.query(sql, queryParams),
  ]);

  const countsRow = countResult.rows[0];

  const counts = {
    all: Number(countsRow.all_count) || 0,
    new: Number(countsRow.new_count) || 0,
    progress: Number(countsRow.progress_count) || 0,
    closed: Number(countsRow.closed_count) || 0,
    cancelled: Number(countsRow.cancelled_count) || 0,
  };

  let currentTabTotal = counts.all;
  if (tab === "new") currentTabTotal = counts.new;
  if (tab === "in_progress") currentTabTotal = counts.progress;
  if (tab === "closed") currentTabTotal = counts.closed;
  if (tab === "cancelled") currentTabTotal = counts.cancelled;

  return {
    leads: queryResult.rows,
    pagination: {
      total: currentTabTotal,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(currentTabTotal / limitNum) || 1,
    },
    counts,
  };
}

async function deleteLead(id) {
  const result = await db.query("DELETE FROM leads WHERE id = $1 RETURNING *", [id]);

  if (result.rowCount === 0) {
    const error = new Error(`Заявка ${id} не найдена`);
    error.status = 404;
    throw error;
  }
}

async function changeStatus(id, status) {
  const result = await db.query("UPDATE leads SET status = $1 WHERE id = $2", [status, id]);

  if (result.rowCount === 0) {
    const error = new Error(`Заявка ${id} не найдена`);
    error.status = 400;
    throw error;
  }
}

module.exports = {
  getLeads,
  deleteLead,
  changeStatus
};
