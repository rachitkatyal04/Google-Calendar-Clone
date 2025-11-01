import React, { useEffect, useMemo, useState } from "react";

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventModal({
  open,
  initialData,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState("#1a73e8");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  const isEditing = useMemo(
    () => Boolean(initialData && initialData._id),
    [initialData]
  );

  useEffect(() => {
    if (!open) return;
    const data = initialData || {};
    setTitle(data.title || "");
    setDescription(data.description || "");
    setAllDay(Boolean(data.allDay));
    setColor(data.color || "#1a73e8");
    setStartLocal(toLocalInputValue(data.start || new Date().toISOString()));
    setEndLocal(
      toLocalInputValue(
        data.end || new Date(Date.now() + 60 * 60 * 1000).toISOString()
      )
    );
  }, [open, initialData]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const startISO = new Date(startLocal).toISOString();
    const endISO = new Date(endLocal).toISOString();
    onSave &&
      onSave({
        title,
        description,
        start: startISO,
        end: endISO,
        allDay,
        color,
      });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? "Edit event" : "Add event"}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <div className="row">
            <label className="field">
              <span>All day</span>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
            </label>
            <label className="field">
              <span>Color</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span>Start</span>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>End</span>
              <input
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="modal-footer">
            {isEditing && onDelete && (
              <button type="button" className="btn danger" onClick={onDelete}>
                Delete
              </button>
            )}
            <div className="spacer" />
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
