const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
    Tournament,
    validateTournament
} = require("../models/tournament");
const {
    Series
} = require("../models/series");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const moment = require("moment");


router.get("/", auth, async (req, res) => {
    const tournaments = await Tournament.find().populate("series", "game");
    res.send(tournaments);
});

router.get("/hosted", auth, async (req, res) => {
    const user = await User.findById(req.user._id).populate({ path: "tournamentsHosted", select: "rounds name" }).select("tournamentsHosted -_id"); 
    res.send(user.tournamentsHosted);
});

router.get("/:id", auth, validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate("series", "game").populate("rounds.hosts.host", "nicknamename");
    if (!tournament) return res.status(400).send("No tournament found."); 
    res.send(tournament);
});

router.post("/", auth, validateAccess("admin"), async (req, res) => {
    /* const {
        error
    } = validateTournament(req.body);
    if (error) return res.status(400).send(error.details[0].message); */

    let tournament = new Tournament(_.pick(req.body, ["name", "series", "game", "startDate", "endDate"]));
    let series;
    if (tournament.series) {
        series = await Series.findById(tournament.series);
        if (!series) return res.status(400).send("No series with the given ID.");
        tournament.name = `#${moment(tournament.startDate).week()} ${moment(tournament.startDate).format("ddd")} ${series.name}`;
    }

    try {
        const savedTournament = await tournament.save();
        if (savedTournament.series !== null) {
            series.tournaments.push(savedTournament._id);
            await series.save();
        }

        res.send(tournament);
    } catch (err) {
        res.status(500).send("Error while saving.");
    }
});

module.exports = router;
