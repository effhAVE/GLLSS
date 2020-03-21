const Joi = require("joi");
const mongoose = require("mongoose");
const { Round } = require("./round");
const tournamentRegions = require("../data/regions");
const games = require("../data/games");

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 120
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  rounds: [Round.schema],
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
    default: null
  },
  game: {
    type: String,
    enum: games
  },
  region: {
    type: String,
    enum: tournamentRegions
  },
  countedByRounds: {
    type: Boolean,
    default: true
  }
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

function validateTournament(tournament) {
  const schema = {
  };

  return Joi.validate(tournament, schema);
}

exports.Tournament = Tournament;
exports.validate = validateTournament;