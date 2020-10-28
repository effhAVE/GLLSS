const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const { Article, validate } = require("../models/article");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const propsFilter = require("../middleware/propsFilter");

router.get("/", auth, validateAccess("articles.view"), async (req, res) => {
  const articles = await Article.find({}).select("-content").populate("author", "nickname").sort("-createdAt");
  return res.send(articles);
});

router.post("/", auth, validateAccess("articles.create"), async (req, res) => {
  const { title, content, contentShort, previewImageURL = "" } = req.body;
  if (!title || !content) return res.status(400).send("One of the fields is missing.");
  const article = new Article({
    title,
    content,
    contentShort,
    previewImageURL,
    author: req.user._id
  });
  await article.save();
  return res.send(article);
});

router.get("/:id", auth, validateAccess("articles.view"), validateObjectId, async (req, res) => {
  const article = await Article.findById(req.params.id).populate("author", "nickname");
  if (!article) return res.status(404).send("No article found.");
  return res.send(article);
});

router.put("/:id", auth, validateAccess("articles.update"), validateObjectId, propsFilter("articlesProps"), async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(400).send("No article found.");

  Article.findOneAndUpdate({ _id: req.params.id }, req.body.filteredProps, { new: true }, (err, article) => {
    return err ? res.send(err) : res.send(article);
  });
});

router.delete("/:id", auth, validateAccess("article.delete"), validateObjectId, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(400).send("No article found.");
  await article.remove();
  return res.send(article);
});

module.exports = router;
