const Joi = require("joi");
const mongoose = require("mongoose");
const {
  Round
} = require("./round");
const tournamentRegions = require("../collections/regions");
const games = require("../collections/games");

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
    name: Joi.string().min(5).max(120).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required(),
    rounds: Joi.array(),
    series: Joi.alternatives().try(Joi.string(), Joi.object()).allow(null),
    game: Joi.when("series", {
      is: Joi.object(),
      then: Joi.allow(""),
      otherwise: Joi.string().required()
    }),
    region: Joi.when("series", {
      is: Joi.object(),
      then: Joi.allow(""),
      otherwise: Joi.string().required()
    }),
    countedByRounds: Joi.boolean()
  };

  return Joi.validate(tournament, schema);
}

exports.Tournament = Tournament;
exports.validate = validateTournament;