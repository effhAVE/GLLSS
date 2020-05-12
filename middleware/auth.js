const jwt = require("jsonwebtoken");
const config = require("config");
const moment = require("moment");

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (ex) {
    if (ex.name === "TokenExpiredError") {
      if (moment().diff(moment(ex.expiredAt), "days") < 3) {
        req.user = jwt.decode(token, config.get("jwtPrivateKey"));
        next();
      } else {
        res.status(401).send("The token has expired.");
      }
    } else {
      res.status(400).send("Invalid token.");
    }
  }
}