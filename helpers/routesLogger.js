const { Log } = require("../models/log");

module.exports = async function (logObject) {
  const log = new Log({
    type: logObject.type,
    documentType: logObject.documentType,
    documentID: logObject.documentID,
    description: logObject.description,
    user: logObject.user
  });

  await log.save();
  return log;
};
