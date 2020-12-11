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
const cloudinary = require("cloudinary").v2;
const { logged } = require("../collections");
const moment = require("moment");

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
    .select("-tournamentsHosted -preferences -details -accounts")
    .sort("_id");
  return res.send(users);
});

router.get("/logged", auth, async (req, res) => {
  let source = {};
  source.name = req.query.name;
  if (req.query.params) {
    const [key, value] = req.query.params.split(":");
    source.params = { [key]: value };
  }

  const user = await User.findById(req.user).select("nickname details.avatar").lean();
  const index = logged.findIndex(el => el._id.equals(user._id));
  if (index !== -1) {
    logged.splice(index, 1);
  }

  setTimeout(() => {
    const index = logged.findIndex(el => el._id.equals(user._id));
    if (index !== -1) {
      logged.splice(index, 1);
    }
  }, 15 * 60 * 1000);

  logged.push({
    _id: user._id,
    nickname: user.nickname,
    avatar: user.details.avatar,
    seen: moment().subtract(10, "seconds").toDate() /* to prevent displaying 'in a few seconds' on client */,
    source
  });
  return res.send(logged.sort((a, b) => b.seen - a.seen));
});

router.get("/birthdays", auth, async (req, res) => {
  const span = +req.query.span || 7;
  const rangeStart = new Date();

  // https://stackoverflow.com/questions/22041785/find-whether-someone-got-a-birthday-in-the-next-30-days-with-mongo
  const users = await User.aggregate([
    {
      $match: {
        "preferences.showBirthday": {
          $eq: true
        }
      }
    },
    {
      $addFields: {
        today: { $dateFromParts: { year: { $year: rangeStart }, month: { $month: rangeStart }, day: { $dayOfMonth: rangeStart } } },
        birthdayThisYear: {
          $dateFromParts: { year: { $year: rangeStart }, month: { $month: "$details.birthday" }, day: { $dayOfMonth: "$details.birthday" } }
        },
        birthdayNextYear: {
          $dateFromParts: {
            year: { $add: [1, { $year: rangeStart }] },
            month: { $month: "$details.birthday" },
            day: { $dayOfMonth: "$details.birthday" }
          }
        }
      }
    },
    {
      $addFields: {
        nextBirthday: { $cond: [{ $gte: ["$birthdayThisYear", "$today"] }, "$birthdayThisYear", "$birthdayNextYear"] }
      }
    },
    {
      $project: {
        daysTillNextBirthday: { $divide: [{ $subtract: ["$nextBirthday", "$today"] }, 24 * 60 * 60 * 1000 /* milliseconds in a day */] },
        nickname: 1,
        birthday: "$details.birthday",
        avatar: "$details.avatar.url",
        _id: 1
      }
    },
    {
      $match: {
        daysTillNextBirthday: {
          $lte: span
        }
      }
    },
    { $sort: { daysTillNextBirthday: 1 } }
  ]);

  return res.send(users);
});

router.get("/me", auth, async (req, res) => {
  let fields = req.query.fields;
  fields = fields.split(",").join(" ");
  const user = await User.findById(req.user._id).select(`${fields} -roles`);
  if (!user) return res.status(404).send("User not found.");
  return res.send(user);
});

router.patch("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-tournamentsHosted");
  user.details = req.body.details;
  user.preferences = req.body.preferences;
  try {
    await user.save();
    return res.send(user);
  } catch (err) {
    return res.status(400).send(err.message);
  }
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

router.get("/unconfirmed", auth, validateAccess("users.confirm"), async (req, res) => {
  const unconfirmedUsers = await User.find({
    roles: []
  })
    .select("nickname isVerified createdAt")
    .sort("-createdAt");

  return res.send(unconfirmedUsers);
});

router.get("/:id", auth, validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id).select("-tournamentsHosted -accounts -id");
  let resUser = user.toJSON(true);
  if (hasPermission(req.user, "users.viewHiddenFields")) resUser.hidden = {};
  if (resUser.preferences.privateEmail) {
    if (resUser.hidden) resUser.hidden.email = resUser.email;
    delete resUser.email;
  }

  if (!resUser.preferences.showBirthday) {
    if (resUser.hidden) {
      resUser.hidden.birthday = resUser.details.birthday;
      resUser.hidden.age = resUser.age;
    }

    delete resUser.details.birthday;
    delete resUser.age;
  }

  delete resUser.preferences;
  return user ? res.send(resUser) : res.status(404).send("User not found.");
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
  if (!user && (!user._id.equals(req.user._id) || !hasPermission(req.user, "usersProps.avatar"))) return res.status(400).send("Bad request.");
  if (user.details.avatar.publicID) await cloudinary.uploader.destroy(user.details.avatar.publicID);
  user.details.avatar = null;
  await user.save();
  return res.send(user);
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

module.exports = router;
