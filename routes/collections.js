const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const https = require('https');
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

router.get("/teamkills", auth, validateAccess("host"), async (req, res) => {
  const matchID = req.query.match;
  if (!matchID) return res.status(400).send("No match ID provided.");

  const options = {
    host: "api.pubg.com",
    path: `/shards/steam/matches/${matchID}`,
    headers: {
      "Accept": "application/vnd.api+json"
    }
  };

  https.get(options, response => {
    let body = "";
    response.on("data", function(chunk) {
      body += chunk;
    });

    response.on("end", function() {
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

router.get("/presets", auth, async (req, res) => {
  res.send(presets);
});

module.exports = router;