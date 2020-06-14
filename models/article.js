const mongoose = require("mongoose");
const Joi = require("joi");
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  contentShort: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    required: true,
    default: ""
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  previewImageURL: {
    type: String,
    default: ""
  },
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});

function validateArticle(article) {
  const schema = {
    title: Joi.string().required(),
    contentShort: Joi.string().allow(""),
    content: Joi.string().required(),
    author: Joi,
    previewImageURL: Joi.string().allow(""),
  };

  return Joi.validate(article, schema);
}

const Article = mongoose.model("Article", articleSchema);

exports.Article = Article;
exports.validate = validateArticle;