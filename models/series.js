const Joi = require("joi");
const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 120
  },
  startDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  endDate: {
    type: Date,
    required: true
  },
  recurrence: {
    type: String,
    required: true,
    enum: ["daily", "weekly"]
  },
  game: {
    type: String,
    enum: ["PUBG", "Autochess", "Apex", "PUBG Mobile"],
    required: true
  },
  tournaments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    }
  ]
});

const Series = mongoose.model("Series", seriesSchema);

function validateSeries(series) {
  const schema = {
  };

  return Joi.validate(series, schema);
}

exports.Series = Series;
exports.validate = validateSeries;