module.exports = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      return res
        .status(401)
        .json({ status: "error", message: "Authorization header missing" });
    }

    if (!auth.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid authorization format" });
    }

    const token = auth.slice(7).trim();
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "Token missing" });

    const authService = require("../services/authService");
    const user = await authService.findByToken(token);
    if (!user)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid token" });

    req.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
};
