module.exports = function (propsName) {
  const returnObject = {};
  let allowedProps = [];
  return async function (req, res, next) {
    for (const role of req.user.roles) {
      allowedProps.push(...role.permissions.filter(perm => perm.split(".")[0].includes(propsName)));
    }

    allowedProps = [...new Set(allowedProps)];
    allowedProps.forEach(prop => {
      const propName = prop.split(".")[1];
      returnObject[propName] = req.body[propName];
    });

    req.body.filteredProps = returnObject;
    next();
  };
};
