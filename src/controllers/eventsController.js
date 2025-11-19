const eventsService = require("../services/eventsService");
const registrationsService = require("../services/registrationsService");

async function getAll(req, res, next) {
  try {
    const { location, category, page, limit } = req.query;
    const filters = { location, category };
    const pagination = { page: Number(page) || 1, limit: Number(limit) || 10 };
    const result = await eventsService.getAll({ filters, pagination });
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const event = await eventsService.getById(id);
    if (!event)
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    res.json({ status: "success", data: event });
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const user = req.user; // set by isLogin middleware
    if (!user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Only admins can create events" });
    }
    const payload = req.body;
    const created = await eventsService.create(payload);
    res.status(201).json({ status: "success", data: created });
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const user = req.user; // set by isLogin middleware
    if (!user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Only admins can update events" });
    }
    const id = req.params.id;
    const payload = req.body;
    const updated = await eventsService.update(id, payload);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    res.json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const user = req.user; // set by isLogin middleware
    if (!user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Only admins can delete events" });
    }
    const id = req.params.id;
    const removed = await eventsService.remove(id);
    if (!removed)
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    res.json({ status: "success", data: removed });
  } catch (err) {
    next(err);
  }
}

async function searchByName(req, res, next) {
  try {
    const { q, page, limit } = req.query;
    const pagination = { page: Number(page) || 1, limit: Number(limit) || 10 };
    const result = await eventsService.searchByName(q || "", pagination);
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

// POST /api/events/:id/register
async function registerForEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    const event = await eventsService.getById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });

    const user = req.user; // set by isLogin middleware
    if (!user)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const created = await registrationsService.create({
      eventId,
      userId: user.id,
      userName: user.nama,
      userEmail: user.email,
    });
    res.status(201).json({ status: "success", data: created });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id/registrations
async function getRegistrationsForEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    const event = await eventsService.getById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });

    const regs = await registrationsService.getByEventId(eventId);
    res.json({ status: "success", data: regs });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/events/:id/registrations/:regId  (admin or owner)
async function cancelRegistrationById(req, res, next) {
  try {
    const { id: eventId, regId } = req.params;
    const reg = await registrationsService.getById(regId);
    if (!reg || reg.eventId !== eventId)
      return res
        .status(404)
        .json({ status: "error", message: "Registration not found" });

    const user = req.user;
    // allow if admin or same user
    if (user.role !== "admin" && user.id !== reg.userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const removed = await registrationsService.removeById(regId);
    res.json({ status: "success", data: removed });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/events/:id/registrations  (cancel current user's registration)
async function cancelRegistrationForCurrentUser(req, res, next) {
  try {
    const eventId = req.params.id;
    const user = req.user;
    if (!user)
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    const removed = await registrationsService.removeByEventAndUser(
      eventId,
      user.id
    );
    if (!removed)
      return res
        .status(404)
        .json({ status: "error", message: "Registration not found" });
    res.json({ status: "success", data: removed });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchByName,
  registerForEvent,
  getRegistrationsForEvent,
  cancelRegistrationById,
  cancelRegistrationForCurrentUser,
};
