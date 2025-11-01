import React, { useEffect, useMemo } from "react";

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
  const diff = d.getDay(); // 0 is Sunday
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

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  onRangeChange,
}) {
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const gridStart = useMemo(() => startOfWeekSunday(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeekSaturday(monthEnd), [monthEnd]);

  useEffect(() => {
    if (onRangeChange) {
      onRangeChange(gridStart.toISOString(), gridEnd.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridStart.getTime(), gridEnd.getTime()]);

  const days = useMemo(() => {
    const arr = [];
    let d = new Date(gridStart);
    while (d <= gridEnd) {
      arr.push(new Date(d));
      d = addDays(d, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  function eventsForDay(day) {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    return (events || []).filter(
      (e) => new Date(e.start) <= endOfDay && new Date(e.end) >= startOfDay
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {weekdays.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const outside = !isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const dayNum = day.getDate();
          return (
            <div
              key={day.toISOString()}
              className={`day-cell${outside ? " outside" : ""}${
                isToday ? " today" : ""
              }`}
              onClick={() => onDayClick && onDayClick(day)}
            >
              <div className="day-number">{dayNum}</div>
              <div className="events">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev._id}
                    className="event-pill"
                    style={{ backgroundColor: ev.color || "#1a73e8" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(ev);
                    }}
                    title={ev.title}
                  >
                    <span className="event-title">{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div
                    className="more-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick && onDayClick(day);
                    }}
                  >
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
