const express = require("express");
const cors = require("cors");
const path = require("path");

const logging = require("./src/middleware/logging");
const errorHandler = require("./src/middleware/errorHandler");

const eventsRouter = require("./src/routes/events");
const authRouter = require("./src/routes/auth");
const registrationsRouter = require("./src/routes/registrations");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logging);

app.use("/api/events", eventsRouter);
app.use("/api/auth", authRouter);
app.use("/api/registrations", registrationsRouter);

app.get("/", (req, res) => {
  res.json({ status: "success", data: { message: "Event Kampus API" } });
});

// 404 for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({ status: "error", message: "Not Found" });
});

// central error handler
app.use(errorHandler);

module.exports = app;
