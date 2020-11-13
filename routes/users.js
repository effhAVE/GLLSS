const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { Role } = require("../models/role");
const { Tournament } = require("../models/tournament");
const { Token } = require("../models/token");
const { Image } = require("../models/image");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { smtpTransport, mailerEmail } = require("../startup/nodemailer");
const hasPermission = require("../helpers/hasPermission");
const winston = require("winston");
const upload = require("../startup/imageUpload");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

async function prepareVerificationEmail(user) {
  const token = new Token({
    user: user._id,
    token: crypto.randomBytes(16).toString("hex")
  });

  const data = {
    to: user.email,
    from: mailerEmail,
    template: "verify-email",
    subject: "GLLSS - Confirm your email",
    context: {
      url: "https://www.gllss.eu/verify-email?token=" + token.token,
      name: user.nickname,
      email: user.email
    }
  };

  await token.save();
  return data;
}

router.get("/", auth, validateAccess("users.view"), async (req, res) => {
  const users = await User.find({
    roles: {
      $ne: []
    }
  })
    .select("-tournamentsHosted")
    .sort("_id");
  return res.send(users);
});

router.get("/:id", auth, validateObjectId, validateAccess("users.view"), async (req, res) => {
  const user = await User.findById(req.params.id).select("-tournamentsHosted");
  return user ? res.send(user) : res.status(404).send("User not found.");
});

router.get("/me/details", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("details -roles");
  return user ? res.send(user.details) : res.status(404).send("User not found.");
});

router.patch("/me/details", auth, async (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true }, (err, user) => {
    return err ? res.send(err) : res.send(user);
  });
});

router.post("/:id/avatar", auth, validateObjectId, upload.single("avatar"), async (req, res) => {
  const user = await User.findById(req.params.id).select("details");
  if (!user && !user._id.equals(req.user._id)) return res.status(400).send("Bad request.");
  if (req.file && req.file.path) {
    if (user.details.avatar) cloudinary.uploader.destroy(user.details.avatar.publicID);
    const image = new Image({
      publicID: req.file.filename,
      url: req.file.path
    });

    user.details.avatar = image;
    await user.save();
    return res.send(user);
  } else {
    winston.log(`Avatar upload error: ${req.file}`);
    return res.status(422).send("Invalid");
  }
});

router.delete("/:id/avatar", auth, validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id).select("details");
  if (!user && !user._id.equals(req.user._id)) return res.status(400).send("Bad request.");
  if (user.details.avatar.publicID) await cloudinary.uploader.destroy(user.details.avatar.publicID);
  user.details.avatar = null;
  await user.save();
  return res.send(user);
});

router.delete("/", auth, validateAccess("users.delete"), async (req, res) => {
  const usersToDelete = req.body;
  if (!Array.isArray(usersToDelete)) return res.status(400).send("Request must be an array of users.");
  for (const user of usersToDelete) {
    const foundUser = await User.findById(user._id);
    if (hasPermission(foundUser, "users.permanent")) return res.status(400).send("User is permanent and cannot be deleted");
    if (foundUser) {
      const tournaments = await Tournament.find({
        _id: {
          $in: foundUser.tournamentsHosted
        }
      });

      for (const tournament of tournaments) {
        tournament.rounds.forEach(round => {
          round.available = round.available.filter(user => !user.equals(foundUser._id));
          round.hosts = round.hosts.filter(hostObject => !hostObject.host.equals(foundUser._id));
          round.teamLeads = round.teamLeads.filter(TLObject => !TLObject.host.equals(foundUser._id));
        });
        await tournament.save();
      }

      await foundUser.remove();
    } else {
      return res.status(400).send("One of the users was not found and cannot be deleted.");
    }
  }

  return res.send(usersToDelete);
});

router.get("/list", auth, validateAccess("users.view"), async (req, res) => {
  const users = await User.find({
    roles: {
      $gt: []
    }
  })
    .select("nickname roles")
    .collation({
      locale: "en"
    })
    .sort("nickname");

  return res.send(users);
});

router.get("/admins", auth, async (req, res) => {
  const users = await User.find({}).select("_id nickname roles").populate("roles", "permissions");
  const admins = users.filter(user => user.roles.some(role => role.permissions.includes("users.confirm"))).map(user => user.nickname);

  return res.send(admins);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.email = req.body.email.toLowerCase();
  let user = await User.findOne({
    $or: [
      {
        email: req.body.email
      },
      {
        nickname: req.body.nickname
      }
    ]
  });

  if (user) return res.status(400).send("User already registered.");
  user = new User(_.pick(req.body, ["nickname", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const data = await prepareVerificationEmail(user);
  smtpTransport.sendMail(data, function (err) {
    if (!err) {
      return res.send("Verification email sent!");
    } else {
      winston.error(err);
      return res.status(500).send(err);
    }
  });
});

router.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("No token provided.");
  const dbToken = await Token.findOne({
    token: token
  });
  if (!dbToken) return res.status(400).send("No token found.");

  const user = await User.findById(dbToken.user);
  if (!user) return res.status(400).send("We were unable to find a user for this token.");
  if (user.isVerified) return res.status(400).send("This user is already verified!");

  user.isVerified = true;
  await user.save();
  res.send("Your accounts has been verified. You can log in.");
});

router.post("/resend-verification", async (req, res) => {
  const email = req.body.email.toLowerCase();
  if (!email) return res.status(400).send("No email provided.");

  const user = await User.findOne({
    email: email
  });
  if (!user) return res.status(400).send("No user with such email.");
  if (user.isVerified) return res.status(400).send("This user is already verified!");
  const data = await prepareVerificationEmail(user);
  smtpTransport.sendMail(data, function (err) {
    if (!err) {
      return res.send("Email sent!");
    } else {
      winston.error(err);
      return res.status(500).send(err);
    }
  });
});

router.put("/:id/roles", auth, validateAccess("users.modifyRoles"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");
  /* if (user._id.equals(req.user._id)) return res.status(400).send("Cannot change own role!"); */
  const rolesList = await Role.find({});
  const roles = req.body;
  if (!roles || !roles.every(role => !!rolesList.find(r => r.equals(role)))) return res.status(400).send("Bad request.");
  user.roles = roles;

  await user.save();
  return res.send(user);
});

router.post("/:id/confirm", auth, validateAccess("users.confirm"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");
  if (user.roles.length) return res.status(400).send("User already confirmed.");

  const hostRole = await Role.findOne({ name: "Host" });
  if (hostRole) user.roles.push(hostRole._id);
  else return res.send(500).send("No Host role to assign.");
  await user.save();

  return res.send(true);
});

router.get("/unconfirmed", auth, validateAccess("users.confirm"), async (req, res) => {
  const unconfirmedUsers = await User.find({
    roles: []
  })
    .select("nickname isVerified createdAt")
    .sort("-createdAt");

  return res.send(unconfirmedUsers);
});

module.exports = router;
