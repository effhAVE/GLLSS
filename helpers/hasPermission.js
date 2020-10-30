function hasPermission(user, permission) {
  return user.roles.some(role => role.permissions.includes(permission));
}

module.exports = function (user, permissionRequired) {
  if (Array.isArray(permissionRequired)) {
    return permissionRequired.some(permission => hasPermission(user, permission));
  } else return hasPermission(user, permissionRequired);
};
