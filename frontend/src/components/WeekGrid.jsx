import React, { useEffect, useMemo } from "react";

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

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekGrid({ currentDate, events, onDayClick, onEventClick, onRangeChange }) {
  const weekStart = useMemo(() => startOfWeekSunday(currentDate), [currentDate]);
  const weekEnd = useMemo(() => endOfWeekSaturday(currentDate), [currentDate]);

  useEffect(() => {
    if (onRangeChange) onRangeChange(weekStart.toISOString(), weekEnd.toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.getTime(), weekEnd.getTime()]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const hourLabels = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  function timedEventsForDay(day) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    return (events || []).filter((e) => !e.allDay && new Date(e.start) <= end && new Date(e.end) >= start);
  }

  function allDayEventsForDay(day) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    return (events || []).filter((e) => e.allDay && new Date(e.start) <= end && new Date(e.end) >= start);
  }

  function getTopAndHeight(ev) {
    const s = new Date(ev.start);
    const e = new Date(ev.end);
    const minutesFromStart = s.getHours() * 60 + s.getMinutes();
    const minutesEnd = e.getHours() * 60 + e.getMinutes();
    const heightMin = Math.max(15, minutesEnd - minutesFromStart);
    const pxPerMinute = 1; // 60px per hour
    return { top: minutesFromStart * pxPerMinute, height: heightMin * pxPerMinute };
  }

  return (
    <div className="week">
      <div className="week-header">
        <div className="time-rail-spacer" />
        {days.map((d) => (
          <div key={d.toDateString()} className="day-header" onClick={() => onDayClick && onDayClick(d)}>
            <div className="day-name">{dayNames[d.getDay()]}</div>
            <div className="day-date">{d.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="all-day">
        <div className="time-rail">All-day</div>
        <div className="all-day-cols">
          {days.map((d) => (
            <div key={d.toISOString()} className="all-day-col">
              {allDayEventsForDay(d).map((ev) => (
                <div
                  key={ev._id}
                  className="event-all-day"
                  style={{ backgroundColor: ev.color || "#1a73e8" }}
                  onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(ev); }}
                  title={ev.title}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="time-grid">
        <div className="time-rail">
          {hourLabels.map((h) => (
            <div key={h} className="time-label">{(h % 12) === 0 ? 12 : (h % 12)} {h < 12 ? "AM" : "PM"}</div>
          ))}
        </div>
        <div className="days-grid">
          {days.map((d) => (
            <div key={d.toISOString()} className="day-col" onClick={() => onDayClick && onDayClick(d)}>
              <div className="hour-lines">
                {hourLabels.map((h) => (
                  <div key={h} className="hour-line" />
                ))}
              </div>
              {(timedEventsForDay(d)).map((ev) => {
                const { top, height } = getTopAndHeight(ev);
                return (
                  <div
                    key={ev._id}
                    className="event-block"
                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: ev.color || "#1a73e8" }}
                    onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(ev); }}
                    title={ev.title}
                  >
                    <div className="event-title">{ev.title}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


