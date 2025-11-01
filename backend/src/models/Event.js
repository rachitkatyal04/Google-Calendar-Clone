const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    allDay: { type: Boolean, default: false },
    color: { type: String, default: "#1a73e8" },
  },
  { timestamps: true }
);

// Basic validation: ensure end >= start
EventSchema.pre("save", function (next) {
  if (this.end < this.start) {
    return next(new Error("End time must be after start time"));
  }
  return next();
});

module.exports = mongoose.model("Event", EventSchema);
