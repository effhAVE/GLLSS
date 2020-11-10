const mongoose = require("mongoose");

const { Schema } = mongoose;
const imageSchema = new Schema({
  url: { type: String },
  publicID: { type: String }
});

const Image = mongoose.model("image", imageSchema);

exports.Image = Image;
