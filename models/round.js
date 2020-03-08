const Joi = require("joi");
const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 40
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  bestOf: {
    type: Number,
    required: true,
    min: 1
  },
  TLValue: {
    type: Number,
    min: 1,
    max: 15
  },
  hosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  teamLeads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

const Round = mongoose.model("Round", roundSchema);

function validateRound(round) {
  const schema = {
  };

  return Joi.validate(round, schema);
}

exports.Round = Round;