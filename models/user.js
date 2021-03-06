const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");
const preferencesObject = require("./user/preferences");
const detailsObject = require("./user/details");

const userSchema = new mongoose.Schema(
  {
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
    isVerified: {
      type: Boolean,
      default: false
    },
    accounts: {
      discord: {
        accessToken: {
          type: String,
          default: null
        },
        refreshToken: {
          type: String,
          default: null
        },
        user: {
          id: {
            type: String
          },
          username: {
            type: String
          },
          avatar: {
            type: String
          },
          discriminator: {
            type: String
          }
        }
      }
    },
    preferences: {
      type: new mongoose.Schema(preferencesObject, { minimize: false, _id: false }),
      default: () => ({})
    },
    details: {
      type: new mongoose.Schema(detailsObject, { minimize: false, _id: false }),
      default: () => ({})
    },
    roles: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
      default: [],
      autopopulate: {
        options: {
          sort: "-importance name"
        }
      }
    },
    tournamentsHosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
      }
    ]
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

userSchema.plugin(require("mongoose-autopopulate"));

userSchema.virtual("age").get(function () {
  return this.details && this.details.birthday ? moment().diff(moment(this.details.birthday), "years") : 0;
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      roles: this.roles,
      nickname: this.nickname
    },
    config.get("jwtPrivateKey"),
    {
      expiresIn: 15 * 60
    }
  );
  return token;
};

userSchema.methods.toJSON = function (virtualsEnabled = false) {
  const obj = this.toObject({ virtuals: virtualsEnabled });
  delete obj.password;
  return obj;
};

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
