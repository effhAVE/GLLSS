const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const {
  Accountcode,
  validate
} = require("../models/accountcode");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const moment = require("moment");

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const {
    adminToken,
    playerToken,
    statsToken,
    expiration
  } = req.body;
  if (!adminToken || !playerToken || !statsToken || !expiration) return res.status(400).send("One of the fields is missing.");
  let code = await Accountcode.findOne({
    adminToken: adminToken
  });

  if (code) return res.status(400).send("Code already created.");
  code = new Accountcode({
    adminToken,
    playerToken,
    statsToken,
    expiration
  });

  await code.save();
  return res.send(code);
});

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const codes = await Accountcode.find({}).populate("assignedUser1 assignedUser2", "-tournamentsHosted").select("-adminToken");
  return res.send(codes);
});

router.get("/:id/admintoken", auth, validateAccess("host"), async (req, res) => {
  const code = await Accountcode.findById(req.params.id).select("assignedUser1 assignedUser2 adminToken");
  if (code.assignedUser1.equals(req.user._id) || code.assignedUser2.equals(req.user._id) || req.user.roles.includes("admin")) {
    return res.send(code.adminToken);
  } else {
    return res.status(400).send("No access to the admin token");
  }
});

router.put("/:id", auth, validateAccess("host"), async (req, res) => {
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");
  const {
    adminToken,
    playerToken,
    statsToken,
    expiration,
    notes
  } = req.body;

  const request = {
    adminToken,
    playerToken,
    statsToken,
    expiration,
    notes
  }

  const {
    error
  } = validate(request);
  if (error) return res.status(400).send(error.details[0].message);

  Object.assign(code, request);
  await code.save();
  return res.send(code);
});

router.put("/:id/assign", auth, validateAccess("admin"), async (req, res) => {
  const slot = req.query.slot || 1;
  const user = req.body.user;
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");
  if (code[`assignedUser${slot}`] && user) return res.status(400).send("This slot is already taken.");
  if (!user) {
    code[`assignedUser${slot}`] = null
  } else {
    code[`assignedUser${slot}`] = user._id;
  }

  await code.save((err, account) => {
    code.populate("assignedUser1 assignedUser2", "-tournamentsHosted", (err, populated) => {
      return res.send(populated);
    });
  });
});

router.delete("/:id", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");
  await code.remove();
  return res.send(code);
});

module.exports = router;