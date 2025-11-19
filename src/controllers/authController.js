const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    if (!result)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const payload = req.body;
    const created = await authService.register(payload);
    res.status(201).json({ status: "success", data: created });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register };
