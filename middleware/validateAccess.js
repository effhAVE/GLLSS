module.exports = function (permissionRequired) {
  let isAllowed = false;
  function hasPermission(user, permission) {
    return user.roles.some(role => role.permissions.includes(permission));
  }

  return async function (req, res, next) {
    if (Array.isArray(permissionRequired)) {
      isAllowed = permissionRequired.some(permission => hasPermission(req.user, permission));
    } else isAllowed = hasPermission(req.user, permissionRequired);

    if (!isAllowed) return res.status(403).send("Access denied.");
    next();
  };
};
