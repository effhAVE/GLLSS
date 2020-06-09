const mongoose = require("mongoose");
const moment = require("moment");
const Joi = require("joi");

const accountcodeSchema = new mongoose.Schema({
  adminToken: {
    type: String,
    required: true,
    unique: true
  },
  playerToken: {
    type: String,
    required: true,
    unique: true
  },
  statsToken: {
    type: String,
    required: true,
    unique: true
  },
  expiration: {
    type: Date,
    required: true,
    set: function(date) {
      date = moment.utc(date).format();
      return date;
    },
    expires: 0
  },
  assignedUser1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedUser2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});

function validateCode(code) {
  const schema = {
    adminToken: Joi.string().required(),
    playerToken: Joi.string().required(),
    statsToken: Joi.string().required(),
    expiration: Joi.date().required(),
    notes: Joi.string().allow(""),
    assignedUser1: Joi,
    assignedUser2: Joi
  };

  return Joi.validate(code, schema);
}

const Accountcode = mongoose.model("Accountcode", accountcodeSchema);
exports.Accountcode = Accountcode;
exports.validate = validateCode;