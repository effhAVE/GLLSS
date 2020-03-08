const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
    Round
} = require("../models/round");
const { Tournament } = require("../models/tournament");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router({ mergeParams: true });

router.post("/", auth, validateAccess("admin") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    const rounds = req.body;

    if (!tournament) return res.status(400).send("No tournament found."); 
    if (typeof rounds !== "object" || !rounds) {
        return res.status(400).send("Bad request.");
    }

    rounds.forEach(el => {
        const round = new Round(el);
        tournament.rounds.push(round);
    });

    await tournament.save();
    res.status(200).send(tournament);
});

module.exports = router;