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
  prepTime: {
    type: Number,
    min: 1,
    max: 15
  },
  hosts: [{
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ready: {
      type: Boolean,
      default: false
    },
    timeBalance: {
      type: Number,
      default: 0
    },
    lostHosting: {
      type: Boolean,
      default: false
    },
    _id: false
  }],
  teamLeads: [{
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ready: {
      type: Boolean,
      default: false
    },
    timeBalance: {
      type: Number,
      default: 0
    },
    lostLeading: {
      type: Boolean,
      default: false
    },
    _id: false
  }],
  available: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

const Round = mongoose.model("Round", roundSchema);

function validateRound(round) {
  const schema = {};

  return Joi.validate(round, schema);
}

exports.Round = Round;

/*

available: Array

"hosts": [
  "5e65395c19109d215056c310",
  "5e6535498be7ac2160321aca"
]

"hosts" : [
  { id: "5e65395c19109d215056c310", ready: false, }
]
*/