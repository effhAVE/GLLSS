const Joi = require("joi");
const mongoose = require("mongoose");
const tournamentRegions = require("../collections/regions");
const games = require("../collections/games");
const recurrences = require("../collections/recurrences");
const regionNames = tournamentRegions.map(region => region.name);
const moment = require("moment");

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
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
  recurrence: {
    type: String,
    required: true,
    enum: recurrences
  },
  game: {
    type: String,
    enum: games,
    required: true
  },
  region: {
    type: String,
    enum: Object.values(regionNames).concat([null])
  },
  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }]
});

const Series = mongoose.model("Series", seriesSchema);

function validateSeries(series) {
  const schema = {
    name: Joi.string().min(2).max(120).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required(),
    recurrence: Joi.string().valid(...recurrences).required(),
    game: Joi.string().valid(...games).required(),
    region: Joi.string().allow(null).valid(...regionNames),
    tournaments: Joi.array()
  };

  return Joi.validate(series, schema);
}

exports.Series = Series;
exports.validate = validateSeries;