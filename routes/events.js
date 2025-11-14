const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/eventsController");
const validateEvent = require("../middleware/validateEvent");
const isLogin = require("../middleware/isLogin");

// GET /api/events?location=&category=&page=&limit=&search=
router.get("/", eventsController.getAll);
router.get("/search", eventsController.searchByName);
// event-specific routes - registrations endpoint is public (for badge counts)
router.get("/:id/registrations", eventsController.getRegistrationsForEvent);
router.post("/:id/register", isLogin, eventsController.registerForEvent);
router.delete(
  "/:id/registrations",
  isLogin,
  eventsController.cancelRegistrationForCurrentUser
);
router.delete(
  "/:id/registrations/:regId",
  isLogin,
  eventsController.cancelRegistrationById
);
router.get("/:id", eventsController.getById);

// Protected routes
router.post("/", isLogin, validateEvent, eventsController.createEvent);
router.put("/:id", isLogin, validateEvent, eventsController.updateEvent);
router.delete("/:id", isLogin, eventsController.deleteEvent);

module.exports = router;
