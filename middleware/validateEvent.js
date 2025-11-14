module.exports = (req, res, next) => {
  const { name, date, location } = req.body;
  const missing = [];
  if (!name) missing.push("name");
  if (!date) missing.push("date");
  if (!location) missing.push("location");

  if (missing.length) {
    return res
      .status(400)
      .json({
        status: "error",
        message: `Missing required fields: ${missing.join(", ")}`,
      });
  }

  next();
};
