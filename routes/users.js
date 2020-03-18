const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user.toJSON());
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send(_.pick(user, ["_id", "name", "email"]));
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
  const unconfirmedUsers = await User.find({ roles: "guest"}).select("name");
  res.send(unconfirmedUsers);
});

module.exports = router;