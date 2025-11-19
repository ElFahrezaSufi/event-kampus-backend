module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err && err.statusCode ? err.statusCode : 500;
  res
    .status(status)
    .json({ status: "error", message: err.message || "Internal Server Error" });
};
