const express = require("express");
const router = express.Router();
const registrationsController = require("../controllers/registrationsController");
const isLogin = require("../middleware/isLogin");

// GET /api/registrations/me
router.get("/me", isLogin, registrationsController.getMyRegistrations);
// GET /api/registrations/user/:userId  (admin can use)
router.get(
  "/user/:userId",
  isLogin,
  registrationsController.getRegistrationsByUser
);

module.exports = router;
