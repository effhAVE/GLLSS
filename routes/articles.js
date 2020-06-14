const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const {
  Article,
  validate
} = require("../models/article");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const articles = await Article.find({}).select("-content").populate("author", "nickname").sort("-createdAt");
  return res.send(articles);
});

router.post("/", auth, validateAccess("teamleader"), async (req, res) => {
  const {
    title,
    content,
    contentShort,
    previewImageURL = ""
  } = req.body;
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

router.get("/:id", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const article = await Article.findById(req.params.id).populate("author", "nickname");
  if (!article) return res.status(404).send("No article found.");
  return res.send(article);
});

router.put("/:id", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const article = await Article.findById(req.params.id).populate("author", "nickname");
  if (!article) return res.status(400).send("No article found.");
  const {
    title,
    content,
    contentShort,
    previewImageURL
  } = req.body;

  const {
    error
  } = validate({
    title,
    content,
    contentShort,
    previewImageURL
  });
  if (error) return res.status(400).send(error.details[0].message);

  Object.assign(article, {
    title,
    content,
    contentShort,
    previewImageURL
  });

  await article.save();
  return res.send(article);
});

router.delete("/:id", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(400).send("No article found.");
  await article.remove();
  return res.send(article);
});


module.exports = router;