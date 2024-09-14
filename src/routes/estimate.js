const express = require("express");
const router = express.Router();

const estimateController = require("../controllers/estimate");

router.post("/", estimateController.getEstimate);

module.exports = router;
