const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const {
  User
} = require("../models/user");
const {
  Gameaccount
} = require("../models/gameaccount");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const schedule = require("node-schedule");
const moment = require("moment");

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const {
    login,
    password
  } = req.body;
  if (!login || !password) return res.status(400).send("One of the fields missing.");
  let account = await Gameaccount.findOne({
    login: login
  });

  if (account) return res.status(400).send("Account already created.");
  account = new Gameaccount({
    login: login,
    password: password
  });

  await account.save();
  return res.send(account);
});

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const accounts = await Gameaccount.find({});
  return res.send(accounts);
});

router.get("/:id", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  return res.send(account);
});

router.put("/:id/access", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const value = req.body.value;
  let query = {};
  const type = value ? "$addToSet" : "$pull";
  query[type] = {
    "haveAccess": req.user._id
  };

  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  await Gameaccount.findByIdAndUpdate(req.params.id, query, {
      new: true
    })
    .exec((error, data) => res.send(data));
});

router.put("/:id/lock", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  account.locked = !account.locked;
  account.save();
  return res.send(account);
});

router.delete("/:id", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  await account.remove();
  return res.send(account);
});

router.put("/:id/claim", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const cancelClaim = req.query.cancel;
  const reqUser = req.user._id;
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  if (account.claimedBy) {
    if (!account.claimedBy.equals(reqUser)) return res.status(400).send("This account is already claimed!");
  }

  const expirationDate = moment().add(8, "hours").toDate();
  if (cancelClaim) {
    account.claimedBy = null;
    account.claimExpiration = null;
  } else {
    account.claimedBy = reqUser;
    account.claimExpiration = expirationDate;
    schedule.scheduleJob(expirationDate, async () => {
      account.claimedBy = null;
      account.claimExpiration = null;
      await account.save();
    });
  }

  await account.save();
  return res.send(account);
});

module.exports = router;