const countries = require("../../collections/countries");
const languages = require("../../collections/languages");
const { Image } = require("../../models/image");

module.exports = {
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
};
