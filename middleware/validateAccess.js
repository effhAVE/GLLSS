const hasPermission = require("../helpers/hasPermission");

module.exports = function (permissionRequired) {
  let isAllowed = false;
  return async function (req, res, next) {
    isAllowed = hasPermission(req.user, permissionRequired);
    if (!isAllowed) return res.status(403).send("Access denied.");

    next();
  };
};
