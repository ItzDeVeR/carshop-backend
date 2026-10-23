const db = require("../config/db");

async function getUserByUsername(username) {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0];
}

async function getUserRoleById(userId) {
  const result = await db.query("SELECT role FROM users WHERE id = $1", [
    userId,
  ]);

  return result.rows[0].role;
}

async function createUser(username, email, phone, password) {
  await db.query(
    "INSERT INTO users (username, email, phone, password_hash) VALUES ($1, $2, $3, $4)",
    [username, email, phone, password],
  );
}

async function getUserById(userId) {
  const result = await db.query(
    "SELECT username, email, phone, full_name, city, avatar_url, created_at FROM users WHERE id = $1 LIMIT 1",
    [userId],
  );

  return result.rows[0];
}

async function changeUserInfo(userId, email, phone, fullName, city) {
  await db.query(
    "UPDATE users SET email = $1, phone = $2, full_name = $3, city = $4 WHERE id = $5",
    [email, phone, fullName, city, userId],
  );
}

async function getPasswordByUserId(userId) {
  const result = await db.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [userId],
  );
  return result.rows[0];
}

async function changeUserPassword(userId, newPassword) {
  await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newPassword,
    userId,
  ]);
}

async function changeUserAvatar(userId, photourl) {
  await db.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [
    photourl,
    userId,
  ]);
}

async function getUsersByRole(role) {
  const result = await db.query("SELECT id, username, full_name FROM users WHERE role = $1", [role]);

  return result.rows;
}

module.exports = {
  getUserByUsername,
  getUserRoleById,
  createUser,
  getUserById,
  changeUserInfo,
  getPasswordByUserId,
  changeUserPassword,
  changeUserAvatar,
  getUsersByRole
};
