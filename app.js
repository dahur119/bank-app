const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const useragent = require("express-useragent");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");
const featureRoute = require("./views/features.routes");
const accountRoute = require("./views/account.routes");

app.use(bodyParser.json());
app.use(useragent.express());
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
