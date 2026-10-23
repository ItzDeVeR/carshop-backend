const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(userid) {
  const token = jwt.sign({ userid }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
}

module.exports = { generateToken, verifyToken };
