const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;

  // Check token exists
  if (!authHeader) {
    return res
      .status(401)
      .json({ msg: "Authorization denied, token is missing" });
  }

  // Verify
  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: "Invalid token " });
  }
};
