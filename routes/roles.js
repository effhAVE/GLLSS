const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const propsFilter = require("../middleware/propsFilter");
const { Role } = require("../models/role");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", auth, validateAccess("roles.create"), async (req, res) => {
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

router.get("/", auth, validateAccess("roles.view"), async (req, res) => {
  const roles = await Role.find({}).sort("-importance");
  return res.send(roles);
});

router.get("/:id", auth, validateAccess("roles.view"), validateObjectId, async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");
  return res.send(role);
});

router.put("/:id", auth, validateAccess("roles.update"), validateObjectId, propsFilter("rolesProps"), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");

  Role.findOneAndUpdate({ _id: req.params.id }, req.body.filteredProps, { new: true }, (err, role) => {
    return err ? res.send(err) : res.send(role);
  });
});

router.delete("/:id", auth, validateAccess("roles.delete"), validateObjectId, async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(400).send("No role found.");

  if (!role.editable) return res.status(400).send("Cannot remove role.");
  await role.remove();
  return res.send(role);
});

module.exports = router;
