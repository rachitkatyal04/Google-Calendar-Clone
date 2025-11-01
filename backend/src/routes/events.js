const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// GET /api/events?start=ISO&end=ISO
// Returns events that overlap the [start, end] range
router.get("/", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const query =
      startDate && endDate
        ? {
            // Overlap condition: event.start < end && event.end > start
            start: { $lt: endDate },
            end: { $gt: startDate },
          }
        : {};

    const events = await Event.find(query).sort({ start: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// POST /api/events
router.post("/", async (req, res, next) => {
  try {
    const { title, description, start, end, allDay, color } = req.body;
    if (!title || !start || !end) {
      res.status(400);
      throw new Error("title, start, and end are required");
    }
    const event = await Event.create({
      title: String(title),
      description: description ? String(description) : "",
      start: new Date(start),
      end: new Date(end),
      allDay: Boolean(allDay),
      color: color || "#1a73e8",
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.start) updates.start = new Date(updates.start);
    if (updates.end) updates.end = new Date(updates.end);

    const event = await Event.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
