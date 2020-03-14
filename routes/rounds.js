const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
    Round
} = require("../models/round");
const { Tournament } = require("../models/tournament");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router({ mergeParams: true });

router.post("/", auth, validateAccess("admin") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    const rounds = req.body;

    if (!tournament) return res.status(400).send("No tournament found."); 
    if (!Array.isArray(rounds)) {
        return res.status(400).send("Bad request.");
    }

    rounds.forEach(el => {
        const round = new Round(el);
        tournament.rounds.push(round);
    });

    tournament.startDate = rounds[0].startDate;
    tournament.endDate = rounds[rounds.length - 1].endDate;
    await tournament.save();
    res.send(tournament);
});

router.get("/", auth, validateAccess("host") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate({ path: "rounds.hosts", select: "name" });
    if (!tournament) return res.status(400).send("No tournament found.");

    res.send(tournament.rounds);
});

router.get("/:rid", auth, validateAccess("host") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate({ path: "rounds.hosts", select: "name" });
    if (!tournament) return res.status(400).send("No tournament found.");

    const round = tournament.rounds.find(el => el._id.equals(req.params.rid));
    if (!round) return res.status(400).send("No round found.");
    res.send(round);
});

router.put("/", auth, validateAccess("admin") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(400).send("No tournament found.");

    if (!Array.isArray(req.body)) {
        return res.status(400).send("Bad request.");
    }

    tournament.rounds = req.body;
    let tournamentHosts = [];
    tournament.rounds.forEach(round => {
        round.hosts.forEach(host => {
            if (!tournamentHosts.includes(host)) tournamentHosts.push(host);
        });
    });

    try {
        tournamentHosts.forEach(async hostID => {
            await User.findByIdAndUpdate(hostID, { "$addToSet": { "tournamentsHosted": tournament._id }}, { new: true });
        });

        tournament.startDate = tournament.rounds[0].startDate;
        tournament.endDate = tournament.rounds[rounds.length - 1].endDate;
    
        await tournament.save();
        res.send(tournament);
    } catch (ex) {
        res.status(500).send("Something failed.");
    }
});

router.put("/:rid", auth, validateAccess("admin") ,validateObjectId, async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(400).send("No tournament found.");

    const round = tournament.rounds.id(req.params.rid);
    if (!round) return res.status(400).send("No round found.");
    
    round.set({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        hosts: req.body.hosts,
        teamLeads: req.body.teamLeads,
        bestOf: req.body.bestOf,
        TLValue: req.body.TLValue
    });

    try {
        round.hosts.forEach(async hostID => {
            await User.findByIdAndUpdate(hostID, { "$addToSet": { "tournamentsHosted": tournament._id }}, { new: true });
        });

        await tournament.save();
        res.send(tournament);
      } catch (ex) {
        res.status(500).send("Something failed.");
      }
});

module.exports = router;