const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");
const tournamentRegions = require("../collections/regions");

const roundSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 40,
    required: true
  },
  localStartDate: Date,
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
  bestOf: {
    type: Number,
    required: true,
    min: 1
  },
  prepTime: {
    type: Number,
    min: 0,
    max: 180,
    default: 0
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
      default: 0,
      min: -480,
      max: 180
    },
    lostHosting: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      default: "Gindex"
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
      default: 0,
      min: -480,
      max: 480
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

roundSchema.pre("save", function(next) {
  const regionObject = tournamentRegions.find(region => region.name === this.parent().region);
  if (regionObject) {
    this.localStartDate = moment(this.startDate).add(regionObject.offset, "hours").format();
  }

  next();
});
const Round = mongoose.model("Round", roundSchema);

function validateRound(round) {
  const schema = {
    name: Joi.string().min(2).max(40).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required(),
    bestOf: Joi.number().required().min(1),
    prepTime: Joi.number().min(0).max(180),
    hosts: Joi.array(),
    teamLeads: Joi.array(),
    available: Joi.array()
  };

  return Joi.validate(round, schema);
}

exports.Round = Round;
exports.validate = validateRound;