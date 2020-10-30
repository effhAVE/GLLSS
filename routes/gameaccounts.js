const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const propsFilter = require("../middleware/propsFilter");
const { User } = require("../models/user");
const { Gameaccount, validate } = require("../models/gameaccount");
const { Preset } = require("../models/preset");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const schedule = require("node-schedule");
const moment = require("moment");
const _ = require("lodash");

router.post("/", auth, validateAccess("accounts.create"), async (req, res) => {
  const { login, password } = req.body;
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

router.get("/", auth, validateAccess("accounts.view"), async (req, res) => {
  const accounts = await Gameaccount.find({}).populate("claimedBy presets.createdBy").sort("_id");
  return res.send(accounts);
});

router.get("/:id", auth, validateAccess("accounts.view"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  return res.send(account);
});

router.put("/:id", auth, validateAccess("accounts.update"), validateObjectId, propsFilter("accountsProps"), async (req, res) => {
  let request = _.pick(req.body, ["login", "password", "claimedBy", "presets", "claimExpiration", "locked", "notes", "haveAccess"]);
  const { error } = validate(request);
  if (error) return res.status(400).send(error.details[0].message);
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");

  request = req.body.filteredProps;
  console.log(request);
  if (request.presets) {
    request.presets = request.presets.map(preset => {
      return preset.name || preset;
    });

    account.presets = account.presets.filter(accountPreset => request.presets.some(preset => accountPreset.name === preset));
    request.presets
      .filter(preset => !account.presets.some(accountPreset => accountPreset.name === preset))
      .forEach(preset => {
        account.presets.push(
          new Preset({
            name: preset,
            createdBy: req.user._id
          })
        );
      });

    delete request.presets;

    await account.save();
  }

  await Gameaccount.findOneAndUpdate({ _id: req.params.id }, request, { new: true }, (err, account) => {
    return err ? res.send(err) : res.send(account);
  });
});

router.put("/:id/access", auth, validateAccess("accounts.markAccess"), validateObjectId, async (req, res) => {
  const value = req.body.value;
  let query = {};
  const type = value ? "$addToSet" : "$pull";
  query[type] = {
    haveAccess: req.user._id
  };

  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  await Gameaccount.findByIdAndUpdate(req.params.id, query, {
    new: true
  }).exec((error, data) => res.send(data));
});

router.put("/:id/lock", auth, validateAccess("accountsProps.locked"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  account.locked = !account.locked;
  account.claimedBy = null;
  account.claimExpiration = null;
  await account.save();
  return res.send(account);
});

router.post("/:id/presets", auth, validateAccess("accountsProps.presets"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  const { name } = req.body;
  if (!name) return res.status(400).send("No name provided");
  const preset = new Preset({
    name: name,
    createdBy: req.user._id
  });

  account.presets.push(preset);
  await account.save();
  return res.send(account);
});

router.delete("/:id", auth, validateAccess("accounts.delete"), validateObjectId, async (req, res) => {
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  await account.remove();
  return res.send(account);
});

router.put("/:id/claim", auth, validateAccess(["accounts.claim", "accountsProps.claimedBy"]), validateObjectId, async (req, res) => {
  const cancelClaim = req.body.cancel;
  const user = req.user._id;
  const reqUser = req.body.user._id;
  const sameUser = user === reqUser;
  const account = await Gameaccount.findById(req.params.id);
  if (!account) return res.status(400).send("No account found.");
  if (account.locked) return res.status(400).send("Cannot claim a locked account!");
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
    account.populate("claimedBy", "-tournamentsHosted", (err, populated) => {
      return res.send(populated);
    });
  });
});

module.exports = router;
