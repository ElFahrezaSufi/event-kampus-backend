const registrationsService = require("../services/registrationsService");

async function getMyRegistrations(req, res, next) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    const regs = await registrationsService.getByUserId(user.id);
    res.json({ status: "success", data: regs });
  } catch (err) {
    next(err);
  }
}

async function getRegistrationsByUser(req, res, next) {
  try {
    const userId = req.params.userId;
    const regs = await registrationsService.getByUserId(userId);
    res.json({ status: "success", data: regs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyRegistrations,
  getRegistrationsByUser,
};
