const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const errorHandler = require("./middleware/errorHandler");
const featureRoute = require("./views/features.routes");
const accountRoute = require("./views/account.routes");

const crypto = require("crypto");

const secretKey = crypto.randomBytes(64).toString("hex");

console.log("SECRET_KEY:", secretKey);

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("combined"));

app.use(errorHandler);

app.use("/account", accountRoute);
app.use("/api", featureRoute);

module.exports = app;
