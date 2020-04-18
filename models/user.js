const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const roles = require("../collections/roles");

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    unique: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  roles: {
    type: [String],
    default: ["guest"],
    enum: roles
  },
  tournamentsHosted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }]
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({
    _id: this._id,
    roles: this.roles,
    nickname: this.nickname
  }, config.get("jwtPrivateKey"), {
    expiresIn: 15 * 60
  });
  return token;
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    nickname: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;