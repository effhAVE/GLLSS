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
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();


router.get("/:id", auth, validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate("series", "game");
    if (!tournament) return res.status(400).send("No tournament found."); 
    res.send(tournament);
});

router.post("/", auth, validateAccess("admin"), async (req, res) => {
    /* const {
        error
    } = validateTournament(req.body);
    if (error) return res.status(400).send(error.details[0].message); */

    let tournament = new Tournament(_.pick(req.body, ["name", "series", "game"]));
    let series;
    if (tournament.series) {
        series = await Series.findById(tournament.series);
        if (!series) return res.status(400).send("No series with the given ID.");
        // tournament.name generated
    }

    try {
        await tournament.save(async (err, tournament) => {
            series.tournaments.push(tournament._id);
            await series.save();
        });
    } catch (err) {
        res.status(500).send("Something failed.");
    }
    
    res.send(tournament);
});

module.exports = router;
