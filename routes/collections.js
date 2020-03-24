const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { roles, games, regions } = require("../collections");

router.get("/roles", auth, async (req, res) => {
    res.send(roles);
});

router.get("/games", auth, async (req, res) => {
    res.send(games);
});

router.get("/regions", auth, async (req, res) => {
    res.send(regions);
});

module.exports = router; 
