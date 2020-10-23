const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    default: "transparent"
  },
  importance: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  permissions: {
    type: [String],
    default: []
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const Role = mongoose.model("Role", roleSchema);
exports.Role = Role;
