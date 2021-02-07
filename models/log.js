const mongoose = require("mongoose");
const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  user: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: { type: Date, expires: 1000 * 60 * 60 * 24 * 14, default: Date.now }
});

const Log = mongoose.model("Log", logSchema);

exports.Log = Log;
