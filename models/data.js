const mongoose = require("mongoose");
const moment = require("moment");
const hash = require("object-hash");

const dataSchema = new mongoose.Schema(
  {
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
    TLRatio: {
      type: Number,
      default: 100,
      min: 1
    },
    calculation: {
      type: Object,
      default: null
    },
    calcHash: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

dataSchema.methods.generateCalcHash = function (calculation) {
  return hash.MD5(calculation);
};

const Data = mongoose.model("Data", dataSchema);

exports.Data = Data;
