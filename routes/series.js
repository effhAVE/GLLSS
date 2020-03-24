const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
    Series
} = require("../models/series");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/list", auth, async (req, res) => {
    const series = await Series.find().select("name");
    res.send(series);
});

module.exports = router;