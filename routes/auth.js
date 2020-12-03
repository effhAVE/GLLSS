const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { smtpTransport, mailerEmail } = require("../startup/nodemailer");
const winston = require("winston");
const axios = require("axios");
const DISCORD_ID = process.env.DISCORD_ID;
const DISCORD_SECRET = process.env.DISCORD_SECRET;
const API_BASE = process.env.NODE_ENV === "production" ? "https://www.gllss.eu/api" : "http://localhost:3000/api";
const CLIENT_BASE = process.env.NODE_ENV === "production" ? "https://www.gllss.eu/" : "http://localhost:8080";
const redirect = encodeURIComponent(`${API_BASE}/auth/discord/callback`);

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    email: req.body.email.toLowerCase()
  }).select("-tournamentsHosted");
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");
  if (!user.isVerified)
    return res.status(401).send({
      type: "not-verified",
      message: "You haven't confirmed your email address."
    });

  const token = user.generateAuthToken();
  return res.send({
    token: token,
    user: user
  });
});

router.get("/discord/login", async (req, res) => {
  const [userID, expiry] = req.query.token.split("-");
  let now = new Date();
  now = now.getTime() / 1000;
  if (!userID || !expiry || expiry - now < 0) return res.status(400).send("Bad request.");

  return res.redirect(
    `https://discordapp.com/api/oauth2/authorize?client_id=${DISCORD_ID}&scope=identify&response_type=code&redirect_uri=${redirect}&state=${userID}`
  );
});

router.post("/discord/logout", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("accounts");
  axios
    .post(
      `https://discordapp.com/api/oauth2/token/revoke`,
      `client_id=${DISCORD_ID}&client_secret=${DISCORD_SECRET}&token=${user.accounts.discord.accessToken}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${user.accounts.discord.accessToken}`
        }
      }
    )
    .then(async response => {
      user.accounts.discord.user = null;
      user.accounts.discord.accessToken = null;
      user.accounts.discord.refreshToken = null;
      await user.save();
      return res.send(response.data);
    })
    .catch(error => {
      winston.log({ level: "error", message: JSON.stringify(error.response.data) });
      return res.status(500).send("Error");
    });
});

router.get("/discord/callback", async (req, res) => {
  if (!req.query.code || !req.query.state) return res.status(500).send("No code provided.");
  const code = req.query.code;
  const userID = req.query.state;
  axios
    .post(
      `https://discordapp.com/api/oauth2/token`,
      `client_id=${DISCORD_ID}&client_secret=${DISCORD_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${redirect}&scope=identify`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )
    .then(async response => {
      axios
        .post(
          "http://discordapp.com/api/users/@me",
          {},
          {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`
            }
          }
        )
        .then(async userResponse => {
          if (userResponse.status === 401) throw new Error("401");
          const user = await User.findById(userID);
          user.accounts.discord.accessToken = response.data.access_token;
          user.accounts.discord.refreshToken = response.data.refresh_token;
          user.accounts.discord.user = Object.assign({}, user.accounts.discord.user, userResponse.data);
          await user.save();
          return res.redirect(`${CLIENT_BASE}/me/edit`);
        })
        .catch(error => {
          winston.log(error);
          return res.status(500).send("Something failed.");
        });
    })
    .catch(error => {
      winston.error(error);
      return res.status(500).send("Error");
    });
});

router.get("/renew", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).send("No user found.");
  }

  const token = user.generateAuthToken();
  return res.send(token);
});

router.post("/password-reset", async (req, res) => {
  const { token, password } = req.body;
  if (!token) return res.status(400).send("No token provided.");
  if (!password) return res.status(400).send("No password provided.");

  const decoded = jwt.decode(token);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(400).send("No user found.");
  const secret = `${user.password.substring(4, 12)}-${user._id.getTimestamp()}`;
  jwt.verify(token, secret, async function (error, verified) {
    if (error) {
      return res.status(400).send("Invalid token.");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
  });

  return res.send("Password changed!");
});

router.post("/forgot-password", async (req, res) => {
  const email = req.body.email.toLowerCase();
  if (!email) {
    return res.status(400).send("No email provided!");
  }

  const user = await User.findOne({
    email: email
  });

  if (!user) return res.status(400).send("No such email in the database.");

  const secret = `${user.password.substring(4, 12)}-${user._id.getTimestamp()}`;
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    secret,
    {
      expiresIn: "1h"
    }
  );

  const data = {
    to: user.email,
    from: mailerEmail,
    template: "password-reset",
    subject: "GLLSS - Password reset",
    context: {
      url: "https://www.gllss.eu/password-reset?token=" + token,
      name: user.nickname
    }
  };

  smtpTransport.sendMail(data, function (err) {
    if (!err) {
      return res.send("Email sent!");
    } else {
      return winston.error(err);
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
