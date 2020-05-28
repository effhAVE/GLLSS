const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  roles,
  games,
  regions,
  recurrences,
  presets
} = require("../collections");

router.get("/roles", auth, async (req, res) => {
  res.send(roles);
});

router.get("/games", auth, async (req, res) => {
  res.send(games);
});

router.get("/regions", auth, async (req, res) => {
  res.send(regions);
});

router.get("/recurrences", auth, async (req, res) => {
  res.send(recurrences);
});

router.get("/presets", auth, async (req, res) => {
  res.send(presets);
});

module.exports = router;