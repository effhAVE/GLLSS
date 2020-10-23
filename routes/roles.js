const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const { Role } = require("../models/role");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const permissions = require("../collections/permissions");

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const { name, color, importance, permissions, editable } = req.body;
  if (!name || !permissions) return res.status(400).send("One of the fields missing.");
  let role = await Role.findOne({
    name: name
  });

  if (role) return res.status(400).send("Account already created.");
  role = new Role({
    name,
    color,
    importance,
    permissions,
    editable
  });

  await role.save();
  return res.send(role);
});

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const roles = await Role.find({}).sort("-importance");
  return res.send(roles);
});

router.get("/:id", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");
  return res.send(role);
});

router.put("/:id", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");
  const roleProps = {
    name: req.body.name,
    color: req.body.color,
    importance: req.body.importance,
    permissions: req.body.permissions,
    editable: req.body.editable
  };

  Role.findOneAndUpdate({ _id: req.params.id }, roleProps, { new: true }, (err, role) => {
    return err ? res.send(err) : res.send(role);
  });
});

router.delete("/:id", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");

  if (!role.editable) return res.status(400).send("Cannot remove role.");
  await role.remove();
  return res.send(role);
});

module.exports = router;
