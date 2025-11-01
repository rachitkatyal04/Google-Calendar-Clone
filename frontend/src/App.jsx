import React, { useEffect, useMemo, useState } from "react";
import CalendarGrid from "./components/CalendarGrid.jsx";
import WeekGrid from "./components/WeekGrid.jsx";
import Sidebar from "./components/Sidebar.jsx";
import EventModal from "./components/EventModal.jsx";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "./api/client.js";

function formatMonthYear(date) {
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const canQuery = useMemo(
    () => Boolean(rangeStart && rangeEnd),
    [rangeStart, rangeEnd]
  );

  useEffect(() => {
    if (!canQuery) return;
    (async () => {
      const data = await getEvents(rangeStart, rangeEnd);
      setEvents(data);
    })();
  }, [canQuery, rangeStart, rangeEnd]);

  function handlePrev() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }

  function handleNext() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleViewChange(next) {
    setView(next);
  }

  function handleDayClick(day) {
    setSelectedDate(day);
    setSelectedEvent(null);
    setIsModalOpen(true);
  }

  function handleEventClick(event) {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  }

  function handleRangeChange(startISO, endISO) {
    setRangeStart(startISO);
    setRangeEnd(endISO);
  }

  async function handleSave(eventData) {
    if (selectedEvent) {
      await updateEvent(selectedEvent._id, eventData);
    } else {
      await createEvent(eventData);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    if (canQuery) {
      const data = await getEvents(rangeStart, rangeEnd);
      setEvents(data);
    }
  }

  async function handleDelete(id) {
    await deleteEvent(id);
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    if (canQuery) {
      const data = await getEvents(rangeStart, rangeEnd);
      setEvents(data);
    }
  }

  const initialModalData = useMemo(() => {
    if (selectedEvent) return selectedEvent;
    if (selectedDate) {
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      end.setHours(start.getHours() + 1);
      return {
        title: "",
        description: "",
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        color: "#1a73e8",
      };
    }
    return null;
  }, [selectedDate, selectedEvent]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">Calendar</div>
        <div className="controls">
          <button onClick={handleToday} className="btn">Today</button>
          <div className="nav">
            <button onClick={handlePrev} className="icon-btn" aria-label="Previous">◀</button>
            <button onClick={handleNext} className="icon-btn" aria-label="Next">▶</button>
          </div>
          <div className="title">{formatMonthYear(currentDate)}</div>
          <div className="spacer" />
          <div className="view-switcher">
            <button className={`btn${view === "week" ? " primary" : ""}`} onClick={() => handleViewChange("week")}>Week</button>
            <button className={`btn${view === "month" ? " primary" : ""}`} onClick={() => handleViewChange("month")}>Month</button>
          </div>
        </div>
      </header>

      <main className="app-main with-sidebar">
        <Sidebar currentDate={currentDate} setCurrentDate={setCurrentDate} />
        <div className="main-pane">
          {view === "month" ? (
            <CalendarGrid
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              onRangeChange={handleRangeChange}
            />
          ) : (
            <WeekGrid
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              onRangeChange={handleRangeChange}
            />
          )}
        </div>
      </main>

      <EventModal
        open={isModalOpen}
        initialData={initialModalData}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        onSave={handleSave}
        onDelete={
          selectedEvent ? () => handleDelete(selectedEvent._id) : undefined
        }
      />
    </div>
  );
}
