const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");
const countries = require("../collections/countries");
const languages = require("../collections/languages");
const { Image } = require("../models/image");

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
    details: {
      name: {
        type: String,
        maxlength: 127,
        default: ""
      },
      birthday: {
        type: Date
      },
      country: {
        type: Object,
        enum: countries
      },
      languages: [
        {
          type: Object,
          enum: languages,
          default: []
        }
      ],
      avatar: {
        type: Image.schema,
        default: null
      },
      gender: {
        type: String,
        enum: ["", "Male", "Female", "Other"],
        default: ""
      },
      bio: {
        type: String,
        default: "",
        maxlength: 2048
      },
      hardware: {
        type: String,
        default: "",
        maxlength: 1024
      },
      socials: {
        facebook: {
          type: String,
          validate: {
            validator: function (value) {
              return /(?:https?:)?\/\/(?:www\.)?(?:facebook|fb)\.com\/(?P<profile>(?![A-z]+\.php)(?!marketplace|gaming|watch|me|messages|help|search|groups)[A-z0-9_\-\.]+)\/?/.test(
                value
              );
            },
            message: props => `${props.value} is not a valid Facebook URL!`
          }
        },
        twitter: {
          type: String,
          validate: {
            validator: function (value) {
              return /(?:https?:)?\/\/(?:[A-z]+\.)?twitter\.com\/@?(?P<username>[A-z0-9_]+)\/status\/(?P<tweet_id>[0-9]+)\/?/.test(value);
            },
            message: props => `${props.value} is not a valid Twitter URL!`
          }
        },
        youtube: {
          type: String,
          validate: {
            validator: function (value) {
              return /(?:https?:)?\/\/(?:[A-z]+\.)?youtube.com\/channel\/(?P<id>[A-z0-9-\_]+)\/?/.test(value);
            },
            message: props => `${props.value} is not a valid YouTube URL!`
          }
        },
        instagram: {
          type: String,
          validate: {
            validator: function (value) {
              return /(?:https?:)?\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/(?P<username>[A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/.test(
                value
              );
            },
            message: props => `${props.value} is not a valid Instagram URL!`
          }
        }
      }
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
  return moment().diff(moment(this.details.birthday), "years");
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

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
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
