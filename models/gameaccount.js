const mongoose = require("mongoose");
const moment = require("moment");
const Joi = require("joi");
const {
  Preset
} = require("../models/preset");

const gameaccountSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  presets: [Preset.schema],
  claimExpiration: {
    type: Date,
    default: null
  },
  locked: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ""
  },
  haveAccess: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});

function validateAccount(account) {
  const schema = {
    login: Joi.string().required(),
    password: Joi.string().required(),
    claimedBy: Joi.allow(null),
    presets: Joi.array(),
    claimExpiration: Joi.date().allow(null),
    locked: Joi.boolean(),
    notes: Joi.string().allow(""),
    haveAccess: Joi.array()
  };

  return Joi.validate(account, schema);
}

const Gameaccount = mongoose.model("Gameaccount", gameaccountSchema);

exports.Gameaccount = Gameaccount;
exports.validate = validateAccount;