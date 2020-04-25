const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");

/* router.get("/routes", auth, validateAccess("admin"), async (req, res) => {
  const routesCollection = mongoose.connection.db.collection("routesLog");
  const logs = await routesCollection.find({});
  logs.toArray().then(logs => {
    res.send(logs);
  });
})
 */
module.exports = router;