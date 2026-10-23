const { JsonWebTokenError } = require("jsonwebtoken");
const { verifyToken } = require("../config/jwt");

module.exports = function (req, res, next) {
  const authString = req.headers.authorization;

  if (!authString || !authString.startsWith("Bearer ")) {
    throw JsonWebTokenError;
  }

  const token = authString.split(" ")[1];

  const result = verifyToken(token);

  req.user = result.userid;

  next();
};
