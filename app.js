const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const IP_ACCESS = process.env.ACCESS_CONTROL_ORIGIN || "*";
const cors = require("cors");

app.use(
  cors({
    origin: IP_ACCESS,
    exposedHeaders: ["x-access-token"]
  })
);
app.use(helmet());
app.use(compression()); //
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "pug");
app.set("views", "./views");
app.use(cookieParser());

app.use("/", require("./api/routes/index.route"));
app.use("/users", require("./api/routes/user.route"));
app.use("/auths", require("./api/routes/auth.route"));
app.use("/tables", require("./api/routes/table.route"));
app.use("/tables/:tableId/rows", require("./api/routes/row.route"));
app.use("/tables/:tableId/cols", require("./api/routes/column.route"));
app.use("/tables/:tableId/cells", require("./api/routes/cell.route"));
app.use("/cells/:cellId/comments", require("./api/routes/comment.route"));
app.use("/notifies", require("./api/routes/notify.route"));
app.use("/teams", require("./api/routes/team.route"));

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: "Something went wrong! " + error });
});

module.exports = app;
