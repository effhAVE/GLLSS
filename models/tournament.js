const Joi = require("joi");
const mongoose = require("mongoose");
const { Round } = require("./round");

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 120
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  rounds: [Round.schema],
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
    default: null
  },
  game: {
    type: String,
    required() {
      return !this.series
    }
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