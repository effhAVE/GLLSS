const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const propsFilter = require("../middleware/propsFilter");
const { Log } = require("../models/log");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const type = req.query.type;
  const user = req.query.user;
  const documentType = req.query.documentType;
  const documentID = req.query.documentID;
  const description = req.query.description || "";

  const query = {
    description: new RegExp(description, "i"),
    documentType: new RegExp(documentType, "i"),
    "user.nickname": new RegExp(user, "i"),
    type: new RegExp(type, "i")
  };

  if (documentID && mongoose.Types.ObjectId.isValid(documentID)) query.documentID = documentID;
  const logs = await Log.find(query);

  return res.send(logs);
});

module.exports = router;
