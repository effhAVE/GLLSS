const mongoose = require("mongoose");
const presetsName = require("../collections/presets");
const presetSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: presetsName,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});

const Preset = mongoose.model("Preset", presetSchema);

exports.Preset = Preset;