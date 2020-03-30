const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
  User,
  validate
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const roles = require("../collections/roles");

router.get("/", auth, validateAccess("admin"), async (req, res) => {
  const users = await User.find({
    roles: {
      $ne: "guest"
    }
  }).select("-tournamentsHosted -password").lean();
  users.forEach(user => {
    user.createdAt = user._id.getTimestamp();
  });

  res.send(users);
});

router.get("/list", auth, validateAccess("teamleader"), async (req, res) => {
  const users = await User.find({
    roles: {
      $ne: "guest"
    }
  }).select("nickname");

  res.send(users);
})

router.get("/admins", auth, async (req, res) => {
  const admins = await User.find({
    roles: "admin"
  }).select("nickname");
  res.send(admins);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user);
});

router.post("/", async (req, res) => {
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    $or: [{
      email: req.body.email
    }, {
      nickname: req.body.nickname
    }]
  });

  if (user) return res.status(400).send("User already registered.");
  user = new User(_.pick(req.body, ["nickname", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send(user);
});

router.put("/:id/roles", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");

  const newRole = req.body.role;
  if (!newRole || !roles.includes(newRole)) return res.status(400).send("Bad request.");
  const rolesIndex = roles.indexOf(newRole);
  if (newRole === "guest") {
    user.roles = ["guest"];
  } else {
    user.roles = roles.filter(role => role !== "guest").slice(rolesIndex);
  }
  await user.save();

  res.send(user);
});

router.post("/:id/confirm", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");
  if (!user.roles.includes("guest")) return res.status(400).send("User already confirmed.");
  user.roles = user.roles.filter(role => role !== "guest");
  user.roles.push("host");
  await user.save();

  res.send(true);
});

router.get("/unconfirmed", auth, validateAccess("admin"), async (req, res) => {
  const unconfirmedUsers = await User.find({
    roles: "guest"
  }).select("nickname").lean();
  unconfirmedUsers.forEach(user => {
    user.createdAt = user._id.getTimestamp();
  });

  res.send(unconfirmedUsers);
});

module.exports = router;