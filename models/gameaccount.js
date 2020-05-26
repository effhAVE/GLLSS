const mongoose = require("mongoose");
const moment = require("moment");

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
  presets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Preset"
  }],
  claimExpiration: {
    type: Date,
    default: null
  },
  locked: {
    type: Boolean,
    default: false
  },
  haveAccess: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

const Gameaccount = mongoose.model("Gameaccount", gameaccountSchema);

exports.Gameaccount = Gameaccount;