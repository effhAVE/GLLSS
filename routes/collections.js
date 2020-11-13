const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const https = require("https");
const axios = require("axios");
const moment = require("moment");
const { games, regions, recurrences, presets, permissions, languages, countries } = require("../collections");
const winston = require("winston");

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

router.get("/permissions", auth, async (req, res) => {
  res.send(permissions);
});

router.get("/languages", auth, async (req, res) => {
  res.send(languages);
});

router.get("/countries", auth, async (req, res) => {
  res.send(countries);
});

router.get("/apex", auth, validateAccess("general.isHost"), async (req, res) => {
  const apiID = req.query.id;
  if (!apiID) return res.status(400).send("No ID provided.");
  axios
    .get(`https://apex.seatlon.eu/api/match/${apiID}`)
    .then(response => {
      if (response.status < 400) {
        const results = Object.values(response.data)
          .filter(match => moment().diff(moment(match.data.time.date), "days") < 2)
          .map(match => {
            return {
              date: match.data.time.date,
              teams: match.data.rosters.map(roster =>
                roster.rosterPlayers.map(player => {
                  return {
                    kills: player.kills,
                    name: player.playerName,
                    teamPlacement: player.teamPlacement
                  };
                })
              )
            };
          });

        return res.send(results);
      } else return res.status(500).send("Could not fetch data.");
    })
    .catch(error => {
      if (error.response.status !== 404) {
        winston.error(error.response.data);
        return res.status(500).send("Could not fetch data.");
      } else return res.status(200).send([]);
    });
});

router.get("/teamkills", auth, validateAccess(["general.isHost", "general.isTL"]), async (req, res) => {
  const matchID = req.query.match;
  if (!matchID) return res.status(400).send("No match ID provided.");

  const options = {
    host: "api.pubg.com",
    path: `/shards/steam/matches/${matchID}`,
    headers: {
      Accept: "application/vnd.api+json"
    }
  };

  https.get(options, response => {
    let body = "";
    response.on("data", function (chunk) {
      body += chunk;
    });

    response.on("end", function () {
      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(body);
          return res.send(data);
        } catch (error) {
          return res.status(500).send(error);
        }
      } else {
        if (response.statusCode === 404) {
          return res.status(400).send("No match found.");
        }

        return res.status(400).send(`API replied with a status ${response.statusCode}`);
      }
    });
  });
});

module.exports = router;
