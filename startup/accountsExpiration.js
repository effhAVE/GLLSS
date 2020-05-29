const {
  Gameaccount
} = require("../models/gameaccount");
const schedule = require("node-schedule");
const mongoose = require("mongoose");

module.exports = function() {
  mongoose.connection.once("connected", async function() {
    const accounts = await Gameaccount.find({});
    for (const account of accounts) {
      if (account.expirationDate) {
        schedule.scheduleJob(account.expirationDate, async () => {
          account.claimedBy = null;
          account.claimExpiration = null;
          await account.save();
        });
      }
    };
  });
}