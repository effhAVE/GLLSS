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
const {
  Tournament
} = require("../models/tournament");
const {
  Token
} = require("../models/token");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const roles = require("../collections/roles");
const crypto = require("crypto");
const {
  smtpTransport,
  mailerEmail
} = require("../startup/nodemailer");

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

router.get("/", auth, validateAccess("admin"), async (req, res) => {
  const users = await User.find({
      roles: {
        $ne: "guest"
      }
    })
    .select("-tournamentsHosted")
    .sort("_id");
  return res.send(users);
});

router.delete("/", auth, validateAccess("masteradmin"), async (req, res) => {
  const usersToDelete = req.body;
  if (!Array.isArray(usersToDelete)) return res.status(400).send("Request must be an array of users.");
  for (const user of usersToDelete) {
    const foundUser = await User.findById(user._id);
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
      };

      await foundUser.remove();
    } else {
      return res.status(400).send("One of the users was not found and cannot be deleted.");
    }
  }

  return res.send(usersToDelete);
});

router.get("/list", auth, validateAccess("teamleader"), async (req, res) => {
  const users = await User.find({
      roles: {
        $ne: "guest"
      }
    })
    .select("nickname roles")
    .collation({
      locale: "en"
    })
    .sort("nickname");

  return res.send(users);
})

router.get("/admins", auth, async (req, res) => {
  const admins = await User.find({
    roles: "admin"
  }).select("nickname");

  return res.send(admins);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.send(400).send("No user found.");
  return res.send(user);
});

router.post("/", async (req, res) => {
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.email = req.body.email.toLowerCase();
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

  const data = await prepareVerificationEmail(user);
  smtpTransport.sendMail(data, function(err) {
    if (!err) {
      return res.send("Verification email sent!");
    } else {
      console.error(err);
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
  smtpTransport.sendMail(data, function(err) {
    if (!err) {
      return res.send("Email sent!");
    } else {
      console.error(err);
      return res.status(500).send(err);
    }
  });
});

router.put("/:id/roles", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");
  if (user._id.equals(req.user._id)) return res.status(400).send("Cannot change own role!");

  const newRole = req.body.role;
  if (!newRole || !roles.includes(newRole)) return res.status(400).send("Bad request.");
  const rolesIndex = roles.indexOf(newRole);
  const currentRoleIndex = req.user.roles.indexOf(newRole);
  if (!req.user.roles.includes("masteradmin") && (currentRoleIndex === -1 || currentRoleIndex === 0)) return res.status(400).send("Cannot set a role to the same or higher value than yours.");

  if (newRole === "guest") {
    user.roles = ["guest"];
  } else {
    user.roles = roles.filter(role => role !== "guest").slice(rolesIndex);
  }

  await user.save();
  return res.send(user);
});

router.post("/:id/confirm", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found.");
  if (!user.roles.includes("guest")) return res.status(400).send("User already confirmed.");
  user.roles = user.roles.filter(role => role !== "guest");
  user.roles.push("host");
  await user.save();

  return res.send(true);
});

router.get("/unconfirmed", auth, validateAccess("admin"), async (req, res) => {
  const unconfirmedUsers = await User.find({
    roles: "guest"
  }).select("nickname isVerified createdAt");

  return res.send(unconfirmedUsers);
});

module.exports = router;