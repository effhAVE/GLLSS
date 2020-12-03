const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const { Accountcode, validate } = require("../models/accountcode");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const propsFilter = require("../middleware/propsFilter");

router.post("/", auth, validateAccess("codes.create"), async (req, res) => {
  const { adminToken, playerToken, statsToken, expiration } = req.body;
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

router.get("/", auth, validateAccess("codes.view"), async (req, res) => {
  let query = {};
  const forUser = req.query.my === undefined || req.query.my.toLowerCase() === "false" ? false : true;
  if (forUser) {
    query = {
      $or: [
        {
          assignedUser1: req.user._id
        },
        {
          assignedUser2: req.user._id
        }
      ]
    };
  }

  const codes = await Accountcode.find(query).populate("assignedUser1 assignedUser2", "nickname").select("-adminToken").sort("createdAt");
  return res.send(codes);
});

router.get("/my", auth, validateAccess("codes.view"), async (req, res) => {
  const codes = await Accountcode.find({
    $or: [
      {
        assignedUser1: req.user._id
      },
      {
        assignedUser2: req.user._id
      }
    ]
  })
    .select("statsToken")
    .sort("createdAt");
  return res.send(codes);
});

router.get("/:id/admintoken", auth, validateAccess("codes.view"), validateObjectId, async (req, res) => {
  const code = await Accountcode.findById(req.params.id).select("assignedUser1 assignedUser2 adminToken");
  if (!code) return res.status(400).send("No code found.");
  if (
    (code.assignedUser1 && code.assignedUser1.equals(req.user._id)) ||
    (code.assignedUser2 && code.assignedUser2.equals(req.user._id)) ||
    req.user.roles.some(role => role.permissions.includes("codes.viewAnyAdminToken"))
  ) {
    return res.send(code.adminToken);
  } else {
    return res.status(400).send("No access to the admin token");
  }
});

router.put("/:id", auth, validateAccess("codes.update"), validateObjectId, propsFilter("codesProps"), async (req, res) => {
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");

  Accountcode.findOneAndUpdate({ _id: req.params.id }, req.body.filteredProps, { new: true }, (err, code) => {
    return err ? res.send(err) : res.send(code);
  });
});

router.put("/:id/assign", auth, validateAccess("codesProps.assignedUser"), validateObjectId, async (req, res) => {
  const slot = req.query.slot || 1;
  const user = req.body.user;
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");
  if (code[`assignedUser${slot}`] && user) return res.status(400).send("This slot is already taken.");
  if (!user) {
    code[`assignedUser${slot}`] = null;
  } else {
    code[`assignedUser${slot}`] = user._id;
  }

  await code.save((err, account) => {
    code.populate("assignedUser1 assignedUser2", "-tournamentsHosted", (err, populated) => {
      return res.send(populated);
    });
  });
});

router.delete("/:id", auth, validateAccess("codes.delete"), validateObjectId, async (req, res) => {
  const code = await Accountcode.findById(req.params.id);
  if (!code) return res.status(400).send("No code found.");
  await code.remove();
  return res.send(code);
});

module.exports = router;
