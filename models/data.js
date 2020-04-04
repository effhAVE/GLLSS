const mongoose = require("mongoose");
const moment = require("moment");

const dataSchema = new mongoose.Schema({
  date: {
    type: String,
    min: 7,
    max: 7,
    unique: true,
    validate: {
      validator(v) {
        [year, month] = v.split("-");
        const correctMonth = +month <= 12 && +month >= 1;
        const correctLength = year.length === 4 && month.length === 2;
        return correctMonth && correctLength;
      }
    }
  },
  calculation: {
    type: Object,
    default: null
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});



const Data = mongoose.model("Data", dataSchema);

exports.Data = Data;