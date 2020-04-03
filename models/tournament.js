const Joi = require("joi");
const mongoose = require("mongoose");
const {
  Round
} = require("./round");
const moment = require("moment");
const tournamentRegions = require("../collections/regions");
const games = require("../collections/games");
const regionNames = tournamentRegions.map(region => region.name);

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 120
  },
  startDate: {
    type: Date,
    required: true,
    set: function(date) {
      date = moment.utc(date).format();
      return date;
    }
  },
  endDate: {
    type: Date,
    required: true,
    set: function(date) {
      date = moment.utc(date).format();
      return date;
    }
  },
  localStartDate: Date,
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
    enum: regionNames
  },
  countedByRounds: {
    type: Boolean,
    default: true
  }
});

tournamentSchema.pre("save", function(next) {
  console.log(this.startDate, this.endDate);
  const regionObject = tournamentRegions.find(region => region.name === this.region);
  this.localStartDate = moment(this.startDate).add(regionObject.offset, "hours").format();
  next();
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