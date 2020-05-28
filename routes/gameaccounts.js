const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const {
  User
} = require("../models/user");
const {
  Gameaccount
} = require("../models/gameaccount");
const {
  Preset
} = require("../models/preset");
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
  const accounts = await Gameaccount.find({}).populate("claimedBy");
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
  account.claimedBy = null;
  account.claimExpiration = null;
  await account.save();
  return res.send(account);
});

router.post("/:id/presets", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  const {
    name
  } = req.body;
  if (!name) return res.status(400).send("No name provided");
  const preset = new Preset({
    name: name,
    createdBy: req.user._id
  });

  account.presets.push(preset);
  await account.save();
  return res.send(account);
});

router.delete("/:id", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  await account.remove();
  return res.send(account);
});

router.put("/:id/claim", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const cancelClaim = req.body.cancel;
  const user = req.user._id;
  const reqUser = req.body.user._id;
  const sameUser = user === reqUser;
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  if (account.claimedBy && sameUser) {
    if (!account.claimedBy.equals(user)) return res.status(400).send("This account is already claimed!");
  }

  const expirationDate = moment().add(8, "hours").toDate();
  if (cancelClaim) {
    account.claimedBy = null;
    account.claimExpiration = null;
  } else {
    account.claimedBy = sameUser ? user : reqUser;
    account.claimExpiration = expirationDate;
    schedule.scheduleJob(expirationDate, async () => {
      account.claimedBy = null;
      account.claimExpiration = null;
      await account.save();
    });
  }

  await account.save((err, account) => {
    account.populate("claimedBy", (err, populated) => {
      return res.send(populated);
    });
  });
});

module.exports = router;