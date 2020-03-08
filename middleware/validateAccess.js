
module.exports = function(roleRequired) {
  return function(req, res, next) { 
    if (!req.user.roles.includes(roleRequired)) return res.status(403).send("Access denied.");
    next();
  }
}