const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const estimateRoute = require("./routes/estimate");

const port = process.env.PORT || 8000;

app.use(express.json());

const corsOpts = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOpts));

app.use("/estimate", estimateRoute);

app.use("*", (req, res) => {
  return res.status(404).send({ message: "Not Found!" });
});

app.listen(port, () => {
  console.log(`Connection successful on port ${port}`);
});

module.exports = app;
