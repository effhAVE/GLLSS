const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
  User
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const {
  smtpTransport,
  mailerEmail
} = require("../startup/nodemailer");

router.post("/", async (req, res) => {
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    email: req.body.email
  });
  if (!user) return res.status(400).send("Invalid email or password.");
  if (!user.isVerified) return res.status(401).send({
    type: "not-verified",
    message: "You haven't confirmed your email address."
  });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send({
    token: token,
    user: user
  });
});

router.get("/renew", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const token = user.generateAuthToken();
  res.send(token);
});

router.post("/password-reset", async (req, res) => {
  const {
    token,
    password
  } = req.body;
  if (!token) return res.status(400).send("No token provided.");
  if (!password) return res.status(400).send("No password provided.");

  const decoded = jwt.decode(token);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).send("No user found.");
  const secret = `${user.password.substring(4, 12)}-${user._id.getTimestamp()}`;
  jwt.verify(token, secret, async function(error, verified) {
    if (error) {
      return res.status(400).send("Invalid token.");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
  });

  res.send("Password changed!");

});

router.post("/forgot-password", async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).send("No email provided!");
  }

  const user = await User.findOne({
    email: email
  });
  if (!user) return res.status(400).send("No such email in the database.");

  const secret = `${user.password.substring(4, 12)}-${user._id.getTimestamp()}`;
  const token = jwt.sign({
    id: user._id,
    email: user.email
  }, secret, {
    expiresIn: "1h"
  });


  const data = {
    to: user.email,
    from: mailerEmail,
    template: "password-reset",
    subject: "GLLSS - Password reset",
    context: {
      url: "https://www.gllss.grzegorz-kowalczyk.eu/password-reset?token=" + token,
      name: user.nickname
    }
  };

  smtpTransport.sendMail(data, function(err) {
    if (!err) {
      return res.send("Email sent!");
    } else {
      return console.error(err);
    }
  });
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;