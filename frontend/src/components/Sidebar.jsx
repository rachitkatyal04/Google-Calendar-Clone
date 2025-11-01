import React, { useMemo } from "react";

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfWeekSunday(date) {
  const d = new Date(date);
  const diff = d.getDay();
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeekSaturday(date) {
  const d = new Date(date);
  const diff = 6 - d.getDay();
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

export default function Sidebar({ currentDate, setCurrentDate, showHolidays = true, onToggleHolidays, onCreate }) {
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const gridStart = useMemo(() => startOfWeekSunday(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeekSaturday(monthEnd), [monthEnd]);

  const days = useMemo(() => {
    const arr = [];
    let d = new Date(gridStart);
    while (d <= gridEnd) {
      arr.push(new Date(d));
      d = addDays(d, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  function goPrevMonth() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }
  function goNextMonth() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }

  return (
    <aside className="sidebar">
      <div className="create-row">
        <button className="btn primary" onClick={() => onCreate && onCreate()}>+ Create</button>
      </div>
      <div className="mini-cal">
        <div className="mini-cal-header">
          <button className="icon-btn" onClick={goPrevMonth}>◀</button>
          <div className="mini-cal-title">
            {currentDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <button className="icon-btn" onClick={goNextMonth}>▶</button>
        </div>
        <div className="mini-weekdays">
          {weekdays.map((w) => (
            <div key={w} className="mini-weekday">{w}</div>
          ))}
        </div>
        <div className="mini-grid">
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={`mini-day${isSameMonth(d, currentDate) ? "" : " outside"}${isSameDay(d, new Date()) ? " today" : ""}`}
              onClick={() => setCurrentDate(d)}
            >
              <span className="mini-day-number">{d.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="search-people">
        <input className="search-input" placeholder="Search for people" />
      </div>
      <div className="sidebar-row">
        <div className="row-title">Booking pages</div>
        <button className="icon-btn small" aria-label="Add booking page">+</button>
      </div>
      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-title">My calendars</div>
        </div>
        <div className="calendar-list">
          <label className="cal-item" style={{ "--accent": "#1a73e8" }}>
            <input type="checkbox" defaultChecked />
            <span className="color-square" />
            <span>Primary</span>
          </label>
          <label className="cal-item" style={{ "--accent": "#34a853" }}>
            <input type="checkbox" defaultChecked />
            <span className="color-square" />
            <span>Birthdays</span>
          </label>
          <label className="cal-item" style={{ "--accent": "#4285f4" }}>
            <input type="checkbox" defaultChecked />
            <span className="color-square" />
            <span>Tasks</span>
          </label>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-title">Other calendars</div>
        </div>
        <div className="calendar-list">
          <label className="cal-item" style={{ "--accent": "#0f9d58" }}>
            <input type="checkbox" checked={!!showHolidays} onChange={() => onToggleHolidays && onToggleHolidays()} />
            <span className="color-square" />
            <span>Holidays in India</span>
          </label>
        </div>
      </div>
    </aside>
  );
}


